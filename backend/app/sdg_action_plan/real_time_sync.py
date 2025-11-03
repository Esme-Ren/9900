import asyncio
import json
from typing import Dict, Set, Optional
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import SDGActionPlan
from .google_docs_service import GoogleDocsService


class SDGFormConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time SDG form collaboration"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_name = None
        self.room_group_name = None
        self.user = None
        self.google_docs_service = None
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.room_name = self.scope['url_route']['kwargs']['form_id']
        self.room_group_name = f'form_{self.room_name}'
        self.user = self.scope['user']
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Initialize Google Docs service
        self.google_docs_service = GoogleDocsService()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to form {self.room_name}',
            'user': self.user.username
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'form_update':
                await self.handle_form_update(data)
            elif message_type == 'google_docs_sync':
                await self.handle_google_docs_sync(data)
            elif message_type == 'user_typing':
                await self.handle_user_typing(data)
            elif message_type == 'cursor_position':
                await self.handle_cursor_position(data)
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error processing message: {str(e)}'
            }))
    
    async def handle_form_update(self, data):
        """Handle form field updates"""
        field_name = data.get('field')
        field_value = data.get('value')
        user_id = data.get('user_id')
        
        # Update form in database
        success = await self.update_form_field(field_name, field_value)
        
        if success:
            # Broadcast update to all users in the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'form_update_broadcast',
                    'field': field_name,
                    'value': field_value,
                    'user_id': user_id,
                    'timestamp': data.get('timestamp')
                }
            )
            
            # Sync with Google Docs if enabled
            if await self.should_sync_to_google_docs():
                await self.sync_to_google_docs()
    
    async def handle_google_docs_sync(self, data):
        """Handle manual Google Docs sync request"""
        try:
            success = await self.sync_to_google_docs()
            
            await self.send(text_data=json.dumps({
                'type': 'google_docs_sync_response',
                'success': success,
                'message': 'Google Docs synced successfully' if success else 'Failed to sync with Google Docs'
            }))
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'google_docs_sync_response',
                'success': False,
                'message': f'Error syncing with Google Docs: {str(e)}'
            }))
    
    async def handle_user_typing(self, data):
        """Handle user typing indicators"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_typing_broadcast',
                'user_id': data.get('user_id'),
                'field': data.get('field'),
                'is_typing': data.get('is_typing')
            }
        )
    
    async def handle_cursor_position(self, data):
        """Handle cursor position updates for collaborative editing"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'cursor_position_broadcast',
                'user_id': data.get('user_id'),
                'field': data.get('field'),
                'position': data.get('position')
            }
        )
    
    async def form_update_broadcast(self, event):
        """Broadcast form updates to all connected clients"""
        await self.send(text_data=json.dumps({
            'type': 'form_update',
            'field': event['field'],
            'value': event['value'],
            'user_id': event['user_id'],
            'timestamp': event['timestamp']
        }))
    
    async def user_typing_broadcast(self, event):
        """Broadcast user typing indicators"""
        await self.send(text_data=json.dumps({
            'type': 'user_typing',
            'user_id': event['user_id'],
            'field': event['field'],
            'is_typing': event['is_typing']
        }))
    
    async def cursor_position_broadcast(self, event):
        """Broadcast cursor positions"""
        await self.send(text_data=json.dumps({
            'type': 'cursor_position',
            'user_id': event['user_id'],
            'field': event['field'],
            'position': event['position']
        }))
    
    @database_sync_to_async
    def update_form_field(self, field_name: str, field_value: str) -> bool:
        """Update form field in database"""
        try:
            form = SDGActionPlan.objects.get(id=self.room_name)
            
            if field_name in ['name_of_designers', 'impact_project_name', 'description']:
                setattr(form, field_name, field_value)
            elif field_name.startswith('plan_content.'):
                # Handle nested plan_content fields
                nested_field = field_name.replace('plan_content.', '')
                if '.' in nested_field:
                    # Handle deeply nested fields like plan_content.steps.input1
                    parts = nested_field.split('.')
                    current = form.plan_content
                    for part in parts[:-1]:
                        if part not in current:
                            current[part] = {}
                        current = current[part]
                    current[parts[-1]] = field_value
                else:
                    form.plan_content[nested_field] = field_value
            
            form.save()
            return True
            
        except SDGActionPlan.DoesNotExist:
            return False
        except Exception as e:
            print(f"Error updating form field: {e}")
            return False
    
    @database_sync_to_async
    def should_sync_to_google_docs(self) -> bool:
        """Check if form should be synced to Google Docs"""
        try:
            form = SDGActionPlan.objects.get(id=self.room_name)
            return form.google_doc_created and form.google_doc_id
        except SDGActionPlan.DoesNotExist:
            return False
    
    async def sync_to_google_docs(self) -> bool:
        """Sync form content to Google Docs"""
        try:
            form_data = await self.get_form_data()
            if not form_data:
                return False
            
            success = self.google_docs_service.update_document(
                form_data['google_doc_id'],
                {
                    'impact_project_name': form_data['impact_project_name'],
                    'name_of_designers': form_data['name_of_designers'],
                    'description': form_data['description'],
                    'plan_content': form_data['plan_content']
                }
            )
            
            if success:
                await self.update_sync_timestamp()
            
            return success
            
        except Exception as e:
            print(f"Error syncing to Google Docs: {e}")
            return False
    
    @database_sync_to_async
    def get_form_data(self) -> Optional[Dict]:
        """Get form data for Google Docs sync"""
        try:
            form = SDGActionPlan.objects.get(id=self.room_name)
            return {
                'google_doc_id': form.google_doc_id,
                'impact_project_name': form.impact_project_name,
                'name_of_designers': form.name_of_designers,
                'description': form.description,
                'plan_content': form.plan_content
            }
        except SDGActionPlan.DoesNotExist:
            return None
    
    @database_sync_to_async
    def update_sync_timestamp(self):
        """Update last sync timestamp"""
        try:
            form = SDGActionPlan.objects.get(id=self.room_name)
            form.last_sync_time = timezone.now()
            form.save()
        except SDGActionPlan.DoesNotExist:
            pass


class CollaborationManager:
    """Manager for handling real-time collaboration features"""
    
    def __init__(self):
        self.active_users: Dict[str, Set[str]] = {}  # form_id -> set of user_ids
        self.user_sessions: Dict[str, str] = {}  # user_id -> form_id
    
    def add_user_to_form(self, user_id: str, form_id: str):
        """Add user to active form collaboration"""
        if form_id not in self.active_users:
            self.active_users[form_id] = set()
        
        self.active_users[form_id].add(user_id)
        self.user_sessions[user_id] = form_id
    
    def remove_user_from_form(self, user_id: str, form_id: str):
        """Remove user from active form collaboration"""
        if form_id in self.active_users:
            self.active_users[form_id].discard(user_id)
            if not self.active_users[form_id]:
                del self.active_users[form_id]
        
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]
    
    def get_active_users_for_form(self, form_id: str) -> Set[str]:
        """Get all active users for a specific form"""
        return self.active_users.get(form_id, set())
    
    def get_user_form(self, user_id: str) -> Optional[str]:
        """Get the form ID that a user is currently editing"""
        return self.user_sessions.get(user_id)


# Global collaboration manager instance
collaboration_manager = CollaborationManager()