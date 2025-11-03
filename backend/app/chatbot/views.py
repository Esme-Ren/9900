from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json
import uuid
from .services import SDGChatbotService
from .serializers import ChatRequestSerializer, ChatResponseSerializer
from .models import ChatSession, ChatMessage

class ChatbotView(View):
    """聊天机器人API视图"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chatbot_service = SDGChatbotService()
    
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)
    
    def post(self, request):
        """处理聊天消息"""
        try:
            # 解析请求数据
            data = json.loads(request.body)
            serializer = ChatRequestSerializer(data=data)
            
            if not serializer.is_valid():
                return Response({
                    'error': 'Invalid request data',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            message = serializer.validated_data['message']
            session_id = serializer.validated_data.get('session_id')
            user_id = serializer.validated_data.get('user_id')
            
            # 如果没有session_id，生成一个新的
            if not session_id:
                session_id = str(uuid.uuid4())
            
            # 处理聊天消息
            result = self.chatbot_service.process_chat_message(
                message=message,
                session_id=session_id,
                user_id=user_id
            )
            
            # 序列化响应
            response_data = {
                'response': result['response'],
                'session_id': result['session_id'],
                'database_used': result['database_used'],
                'metadata': result['metadata']
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except json.JSONDecodeError:
            return Response({
                'error': 'Invalid JSON format'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """获取聊天历史"""
        try:
            session_id = request.GET.get('session_id')
            if not session_id:
                return Response({
                    'error': 'session_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 获取会话
            try:
                session = ChatSession.objects.get(session_id=session_id)
            except ChatSession.DoesNotExist:
                return Response({
                    'error': 'Session not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 获取聊天历史
            messages = ChatMessage.objects.filter(session=session).order_by('timestamp')
            
            history = []
            for msg in messages:
                history.append({
                    'id': msg.id,
                    'type': msg.message_type,
                    'content': msg.content,
                    'timestamp': msg.timestamp.isoformat(),
                    'metadata': msg.metadata
                })
            
            return Response({
                'session_id': session_id,
                'history': history
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def chat_message(request):
    """处理聊天消息的API端点"""
    try:
        print(f"Received chat request: {request.data}")
        
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
            return Response({
                'error': 'Invalid request data',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        message = serializer.validated_data['message']
        session_id = serializer.validated_data.get('session_id')
        user_id = serializer.validated_data.get('user_id')
        
        print(f"Processing message: '{message}', session_id: {session_id}, user_id: {user_id}")
        
        # 如果没有session_id，生成一个新的
        if not session_id:
            session_id = str(uuid.uuid4())
            print(f"Generated new session_id: {session_id}")
        
        # 处理聊天消息
        chatbot_service = SDGChatbotService()
        result = chatbot_service.process_chat_message(
            message=message,
            session_id=session_id,
            user_id=user_id
        )
        
        print(f"Chatbot service result: {result}")
        
        # 序列化响应
        response_data = {
            'response': result['response'],
            'session_id': result['session_id'],
            'database_used': result['database_used'],
            'metadata': result['metadata']
        }
        
        print(f"Sending response: {response_data}")
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in chat_message: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Internal server error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def chat_history(request):
    """获取聊天历史"""
    try:
        session_id = request.GET.get('session_id')
        if not session_id:
            return Response({
                'error': 'session_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 获取会话
        try:
            session = ChatSession.objects.get(session_id=session_id)
        except ChatSession.DoesNotExist:
            return Response({
                'error': 'Session not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # 获取聊天历史
        messages = ChatMessage.objects.filter(session=session).order_by('timestamp')
        
        history = []
        for msg in messages:
            history.append({
                'id': msg.id,
                'type': msg.message_type,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'metadata': msg.metadata
            })
        
        return Response({
            'session_id': session_id,
            'history': history
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Internal server error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_session(request):
    """创建新的聊天会话"""
    try:
        user_id = request.data.get('user_id')
        session_id = str(uuid.uuid4())
        
        chatbot_service = SDGChatbotService()
        session = chatbot_service.create_or_get_session(session_id, user_id)
        
        return Response({
            'session_id': session_id,
            'created_at': session.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'Internal server error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 