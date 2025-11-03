from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Team, TeamMember

class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'description']

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer()
    joined_on = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = ['user', 'role', 'is_pending', 'joined_on', 'can_invite']

    def get_joined_on(self, obj):
        return obj.joined_on.strftime('%d %b %Y, %I:%M %p') #Readable Date String