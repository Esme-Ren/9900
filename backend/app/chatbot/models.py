from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class ChatSession(models.Model):
    """聊天会话模型"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'chat_session'

    def __str__(self):
        return f"Session {self.session_id} - {self.user.username if self.user else 'Anonymous'}"

class ChatMessage(models.Model):
    """聊天消息模型"""
    MESSAGE_TYPES = [
        ('user', 'User Message'),
        ('assistant', 'Assistant Message'),
        ('system', 'System Message'),
    ]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)  # 存储额外信息，如数据源、搜索关键词等

    class Meta:
        db_table = 'chat_message'
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."

class DatabaseSearchLog(models.Model):
    """数据库搜索日志"""
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='search_logs')
    query = models.TextField()
    search_type = models.CharField(max_length=50)  # 'keywords', 'actions', 'education'
    results_count = models.IntegerField(default=0)
    found_in_database = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'database_search_log'

    def __str__(self):
        return f"Search: {self.query[:50]}... ({self.search_type})" 