from rest_framework import serializers
from .models import EducationInteraction, ActionInteraction, UserSearchHistory, UserPageActivity, SDGFormActivity, UserBrowserActivity


class EducationInteractionSerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = EducationInteraction
        fields = ['id', 'userId', 'educationId', 'educationName', 'related_sdgs',
                  'related_disciplines', 'related_industries', 'timestamp']

    def get_timestamp(self, obj):
        return obj.timestamp.strftime('%d %b %Y, %I:%M:%S %p')


class ActionInteractionSerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = ActionInteraction
        fields = ['id', 'userId', 'actionId', 'actionName',
                  'related_sdgs', 'related_industries', 'timestamp']

    def get_timestamp(self, obj):
        return obj.timestamp.strftime('%d %b %Y, %I:%M:%S %p')


class UserSearchHistorySerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = UserSearchHistory
        fields = ['id', 'user', 'search_query', 'search_type', 'timestamp', 'session_id']

    def get_timestamp(self, obj):
        return obj.timestamp.strftime('%d %b %Y, %I:%M:%S %p')


class UserPageActivitySerializer(serializers.ModelSerializer):
    first_visit = serializers.SerializerMethodField()
    last_visit = serializers.SerializerMethodField()

    class Meta:
        model = UserPageActivity
        fields = ['id', 'user', 'page_url', 'page_title', 'time_spent', 'visit_count', 
                  'first_visit', 'last_visit', 'session_id']

    def get_first_visit(self, obj):
        return obj.first_visit.strftime('%d %b %Y, %I:%M:%S %p')

    def get_last_visit(self, obj):
        return obj.last_visit.strftime('%d %b %Y, %I:%M:%S %p')


class SDGFormActivitySerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = SDGFormActivity
        fields = ['id', 'user', 'form', 'activity_type', 'field_name', 'content_length', 
                  'timestamp', 'session_id']

    def get_timestamp(self, obj):
        return obj.timestamp.strftime('%d %b %Y, %I:%M:%S %p')


class UserBrowserActivitySerializer(serializers.ModelSerializer):
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = UserBrowserActivity
        fields = ['id', 'user', 'activity_type', 'element_id', 'element_type', 'page_url', 
                  'timestamp', 'session_id', 'metadata']

    def get_timestamp(self, obj):
        return obj.timestamp.strftime('%d %b %Y, %I:%M:%S %p')
