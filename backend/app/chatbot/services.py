import re
import json
import requests
from typing import List, Dict, Tuple, Optional
from django.db.models import Q
from django.conf import settings
from .models import ChatSession, ChatMessage, DatabaseSearchLog
from sdg_keywords.models import Keyword
from sdg_actions.models import ActionDb
from sdg_education.models import EducationDb

class SDGChatbotService:
    """SDG聊天机器人服务"""
    
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.openai_base_url = getattr(settings, 'OPENAI_BASE_URL', 'https://api.openai.com/v1')
        
    def create_or_get_session(self, session_id: str, user_id: Optional[int] = None) -> ChatSession:
        """创建或获取聊天会话"""
        session, created = ChatSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'user_id': user_id,
                'is_active': True
            }
        )
        return session
    
    def save_message(self, session: ChatSession, message_type: str, content: str, metadata: Dict = None) -> ChatMessage:
        """保存聊天消息"""
        return ChatMessage.objects.create(
            session=session,
            message_type=message_type,
            content=content,
            metadata=metadata or {}
        )
    
    def search_database(self, query: str) -> Dict:
        """在三个数据库中搜索相关信息"""
        search_results = {
            'keywords': [],
            'actions': [],
            'education': [],
            'total_found': 0
        }
        
        # 搜索关键词数据库
        keyword_results = Keyword.objects.filter(
            Q(keyword__icontains=query) |
            Q(sdggoal__icontains=query) |
            Q(target__icontains=query) |
            Q(note__icontains=query)
        )[:5]
        
        search_results['keywords'] = [
            {
                'type': 'keyword',
                'content': f"关键词: {kw.keyword}, SDG目标: {kw.sdggoal}, 具体目标: {kw.target}",
                'details': {
                    'keyword': kw.keyword,
                    'sdg_goal': kw.sdggoal,
                    'target': kw.target,
                    'reference1': kw.reference1,
                    'reference2': kw.reference2,
                    'note': kw.note
                }
            }
            for kw in keyword_results
        ]
        
        # 搜索行动数据库
        action_results = ActionDb.objects.filter(
            Q(actions__icontains=query) |
            Q(action_detail__icontains=query) |
            Q(sources__icontains=query)
        )[:5]
        
        search_results['actions'] = [
            {
                'type': 'action',
                'content': f"行动: {action.actions}, 详情: {action.action_detail[:200]}...",
                'details': {
                    'action': action.actions,
                    'detail': action.action_detail,
                    'sdgs': action.sdgs,
                    'level': action.level,
                    'location': action.location,
                    'sources': action.sources,
                    'links': action.links
                }
            }
            for action in action_results
        ]
        
        # 搜索教育数据库
        education_results = EducationDb.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(aims__icontains=query) |
            Q(learning_outcome__icontains=query)
        )[:5]
        
        search_results['education'] = [
            {
                'type': 'education',
                'content': f"教育项目: {edu.title}, 描述: {edu.description[:200] if edu.description else ''}...",
                'details': {
                    'title': edu.title,
                    'description': edu.description,
                    'aims': edu.aims,
                    'sdgs_related': edu.sdgs_related,
                    'organization': edu.organization,
                    'location': edu.location,
                    'sources': edu.sources,
                    'links': edu.links
                }
            }
            for edu in education_results
        ]
        
        search_results['total_found'] = (
            len(search_results['keywords']) + 
            len(search_results['actions']) + 
            len(search_results['education'])
        )
        
        return search_results
    
    def log_search(self, session: ChatSession, query: str, search_results: Dict) -> List[DatabaseSearchLog]:
        """记录搜索日志"""
        logs = []
        
        for search_type in ['keywords', 'actions', 'education']:
            results = search_results[search_type]
            log = DatabaseSearchLog.objects.create(
                session=session,
                query=query,
                search_type=search_type,
                results_count=len(results),
                found_in_database=len(results) > 0
            )
            logs.append(log)
        
        return logs
    
    def generate_ai_response(self, user_message: str, search_results: Dict, conversation_history: List[Dict]) -> str:
        """生成AI响应"""
        
        # 检查是否有数据库结果
        total_found = search_results.get('total_found', 0)
        
        # 如果有数据库结果，使用英文回复数据库内容
        if total_found > 0:
            return self._generate_database_response(search_results)
        
        # 如果没有数据库结果，尝试调用OpenAI API
        if self.openai_api_key:
            print(f"OpenAI API key found, calling API for query: {user_message}")
            return self._call_openai_api_for_no_database_result(user_message, conversation_history)
        else:
            print("No OpenAI API key found, using local response")
            return self._generate_local_response(user_message, search_results)
    
    def _generate_database_response(self, search_results: Dict) -> str:
        """生成数据库响应（英文）"""
        response_parts = [f"Based on our SDG database, I found the following relevant information:\n"]
        
        # 添加关键词信息
        if search_results.get('keywords'):
            response_parts.append("**Keyword Information:**")
            for kw in search_results['keywords'][:3]:
                response_parts.append(f"- {kw['content']}")
            response_parts.append("")
        
        # 添加行动信息
        if search_results.get('actions'):
            response_parts.append("**Related Actions:**")
            for action in search_results['actions'][:3]:
                response_parts.append(f"- {action['content']}")
            response_parts.append("")
        
        # 添加教育信息
        if search_results.get('education'):
            response_parts.append("**Educational Resources:**")
            for edu in search_results['education'][:3]:
                response_parts.append(f"- {edu['content']}")
            response_parts.append("")
        
        response_parts.append("This information comes from our SDG professional database. If you need more detailed information, please visit the corresponding database pages.")
        
        return "\n".join(response_parts)
    
    def _call_openai_api_for_no_database_result(self, user_message: str, conversation_history: List[Dict]) -> str:
        """当数据库中没有结果时调用OpenAI API"""
        try:
            system_prompt = """You are a professional SDG (Sustainable Development Goals) expert assistant. 

When responding to user questions about SDG topics:
1. Provide comprehensive and accurate information about SDG-related topics
2. Always respond in English
3. Include relevant SDG goals and targets when applicable
4. Provide practical insights and examples
5. Keep responses informative but concise

Please provide professional and accurate answers about SDG topics."""

            user_prompt = f"""
User Question: {user_message}

Note: This information was not found in our SDG database, so I'm providing you with comprehensive SDG knowledge.

Please provide a detailed answer about this SDG-related topic.
"""

            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            messages = [{'role': 'system', 'content': system_prompt}]
            
            # 添加对话历史
            for msg in conversation_history[-5:]:  # 只保留最近5条消息
                messages.append({
                    'role': 'user' if msg['type'] == 'user' else 'assistant',
                    'content': msg['content']
                })
            
            messages.append({'role': 'user', 'content': user_prompt})
            
            data = {
                'model': 'gpt-3.5-turbo',
                'messages': messages,
                'max_tokens': 800,
                'temperature': 0.7
            }
            
            print(f"Calling OpenAI API with data: {data}")
            
            response = requests.post(
                f'{self.openai_base_url}/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            print(f"OpenAI API response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                api_response = result['choices'][0]['message']['content']
                print(f"OpenAI API response: {api_response[:100]}...")
                
                # 在API响应前添加说明
                return f"""I couldn't find specific information about "{user_message}" in our SDG database, but I can provide you with comprehensive SDG knowledge on this topic:

{api_response}"""
            else:
                print(f"OpenAI API error: {response.text}")
                return self._generate_local_response(user_message, {'total_found': 0})
                
        except Exception as e:
            print(f"OpenAI API调用失败: {e}")
            import traceback
            traceback.print_exc()
            return self._generate_local_response(user_message, {'total_found': 0})
    
    def _call_openai_api(self, system_prompt: str, user_prompt: str, conversation_history: List[Dict]) -> str:
        """调用OpenAI API（保留原有方法）"""
        try:
            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            messages = [{'role': 'system', 'content': system_prompt}]
            
            # 添加对话历史
            for msg in conversation_history[-10:]:  # 只保留最近10条消息
                messages.append({
                    'role': 'user' if msg['type'] == 'user' else 'assistant',
                    'content': msg['content']
                })
            
            messages.append({'role': 'user', 'content': user_prompt})
            
            data = {
                'model': 'gpt-3.5-turbo',
                'messages': messages,
                'max_tokens': 1000,
                'temperature': 0.7
            }
            
            response = requests.post(
                f'{self.openai_base_url}/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                return self._generate_local_response(user_prompt, {})
                
        except Exception as e:
            print(f"OpenAI API调用失败: {e}")
            return self._generate_local_response(user_prompt, {})
    
    def _generate_local_response(self, user_message: str, search_results: Dict) -> str:
        """本地生成响应（当没有OpenAI API时）"""
        
        # 检查是否有数据库结果
        total_found = search_results.get('total_found', 0)
        
        if total_found == 0:
            return f"""I apologize, but I couldn't find information related to "{user_message}" in our SDG database.

Note: OpenAI API is not available, so I cannot provide additional SDG knowledge.

Suggestions:
1. Try using different keywords to rephrase your question
2. You can visit our SDG database pages for detailed searches
3. For more specific questions, consider searching the internet for related SDG information

If you need to view our database content, please visit:
- SDG Keywords: /sdg-keywords
- SDG Actions: /sdg-action  
- SDG Education: /sdg-education"""

        # 如果有数据库结果，使用数据库响应方法
        return self._generate_database_response(search_results)
    
    def get_conversation_history(self, session: ChatSession, limit: int = 10) -> List[Dict]:
        """获取对话历史"""
        messages = ChatMessage.objects.filter(session=session).order_by('-timestamp')[:limit]
        return [
            {
                'type': msg.message_type,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat()
            }
            for msg in reversed(messages)  # 按时间正序返回
        ]
    
    def process_chat_message(self, message: str, session_id: str, user_id: Optional[int] = None) -> Dict:
        """处理聊天消息"""
        try:
            print(f"Processing chat message: '{message}'")
            
            # 创建或获取会话
            session = self.create_or_get_session(session_id, user_id)
            print(f"Session created/retrieved: {session.session_id}")
            
            # 保存用户消息
            user_msg = self.save_message(session, 'user', message)
            print(f"User message saved: {user_msg.id}")
            
            # 搜索数据库
            search_results = self.search_database(message)
            print(f"Search results: {search_results['total_found']} items found")
            
            # 记录搜索日志
            search_logs = self.log_search(session, message, search_results)
            print(f"Search logs created: {len(search_logs)} logs")
            
            # 获取对话历史
            conversation_history = self.get_conversation_history(session)
            print(f"Conversation history: {len(conversation_history)} messages")
            
            # 生成AI响应
            ai_response = self.generate_ai_response(message, search_results, conversation_history)
            print(f"AI response generated: {len(ai_response)} characters")
            
            # 保存AI响应
            metadata = {
                'database_used': search_results['total_found'] > 0,
                'search_results_count': search_results['total_found'],
                'search_logs': [log.id for log in search_logs]
            }
            assistant_msg = self.save_message(session, 'assistant', ai_response, metadata)
            print(f"Assistant message saved: {assistant_msg.id}")
            
            result = {
                'response': ai_response,
                'session_id': session_id,
                'database_used': search_results['total_found'] > 0,
                'search_logs': search_logs,
                'metadata': metadata
            }
            
            print(f"Process chat message completed successfully")
            return result
            
        except Exception as e:
            print(f"Error in process_chat_message: {str(e)}")
            import traceback
            traceback.print_exc()
            raise 