from rest_framework import serializers
from .models import SDGActionPlan
from teams.models import TeamMember


class SDGActionPlanSerializer(serializers.ModelSerializer):
    # 添加权限相关的只读字段
    can_edit = serializers.SerializerMethodField()
    can_view = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = SDGActionPlan
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at', 'editors', 'viewers']

    def get_permissions(self, obj):
        """返回表单的权限设置"""
        return {
            'allow_team_edit': obj.allow_team_edit,
            'allow_team_view': obj.allow_team_view,
            'require_explicit_permissions': obj.require_explicit_permissions,
        }

    def get_can_edit(self, obj):
        """Check if current user has edit permission"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Creator always has edit permission
        if obj.user == user:
            return True
            
        # Check if user is explicitly specified as editor (highest priority)
        if obj.editors.filter(id=user.id).exists():
            return True
            
        # Check team permissions
        team_member = TeamMember.objects.filter(
            team=obj.team, 
            user=user, 
            is_pending=False
        ).first()
        
        if team_member:
            # Team owner always has edit permission
            if team_member.role == 'owner':
                return True
                
            # If team edit is allowed
            if obj.allow_team_edit:
                # Team admins can edit
                if team_member.role == 'admin':
                    return True
                # If explicit permissions not required, regular members can edit
                elif not obj.require_explicit_permissions:
                    return True
        
        return False

    def get_can_view(self, obj):
        """Check if current user has view permission"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Creator always has view permission
        if obj.user == user:
            return True
            
        # Check if user is explicitly specified as viewer (highest priority)
        if obj.viewers.filter(id=user.id).exists():
            return True
            
        # Check team permissions
        team_member = TeamMember.objects.filter(
            team=obj.team, 
            user=user, 
            is_pending=False
        ).first()
        
        if team_member:
            # Team owner always has view permission
            if team_member.role == 'owner':
                return True
                
            # If team view is allowed
            if obj.allow_team_view:
                # Team members can view
                return True
        
        return False

    def get_is_owner(self, obj):
        """检查当前用户是否是团队所有者或表单创建者"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # 表单创建者也被视为所有者
        if obj.user == user:
            return True
            
        team_member = TeamMember.objects.filter(
            team=obj.team, 
            user=user, 
            is_pending=False
        ).first()
        
        return team_member and team_member.role == 'owner'

    def update(self, instance, validated_data):
        # Remove the team field if it's present to prevent updating it
        validated_data.pop('team', None)
        return super().update(instance, validated_data)
