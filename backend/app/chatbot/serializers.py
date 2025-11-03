from rest_framework import serializers
from .models import ChatSession, ChatMessage, DatabaseSearchLog

class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = ['id', 'session_id', 'created_at', 'updated_at', 'is_active']

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_type', 'content', 'timestamp', 'metadata']

class DatabaseSearchLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseSearchLog
        fields = ['id', 'query', 'search_type', 'results_count', 'found_in_database', 'timestamp']

class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=2000)
    session_id = serializers.CharField(max_length=100, required=False)
    user_id = serializers.IntegerField(required=False)

class ChatResponseSerializer(serializers.Serializer):
    response = serializers.CharField()
    session_id = serializers.CharField()
    database_used = serializers.BooleanField()
    search_logs = DatabaseSearchLogSerializer(many=True, read_only=True)
    metadata = serializers.JSONField() 