from django.db import models
from django.contrib.auth.models import User

#Model for teams
class Team(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    max_members = models.IntegerField(default=6)  # 默认最大6人

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # 如果是新创建的团队，使用全局设置作为默认值
        if not self.pk:  # 新创建的团队
            try:
                from admin_portal.models import GlobalSettings
                global_max = GlobalSettings.get_setting("default_team_max_members", "6")
                self.max_members = int(global_max)
            except:
                # 如果获取全局设置失败，使用默认值6
                self.max_members = 6
        super().save(*args, **kwargs)

    def get_current_member_count(self):
        """获取当前活跃成员数量（不包括待邀请的）"""
        return self.members.filter(is_pending=False).count()

    def can_add_member(self):
        """检查是否可以添加新成员"""
        return self.get_current_member_count() < self.max_members

#Model for members of a team
class TeamMember(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    is_pending = models.BooleanField(default=True)
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='team_inviter')
    joined_on = models.DateTimeField(auto_now_add=True)
    can_invite = models.BooleanField(default=False) 

    class Meta:
        unique_together = ('user', 'team')

    def __str__(self):
        return f"{self.user.username} in {self.team.name} as {self.role}"

# 邮件邀请模型
class EmailInvitation(models.Model):
    email = models.EmailField()
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='email_invitations')
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_invitations_sent')
    token = models.CharField(max_length=100, unique=True)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"Invitation to {self.email} for {self.team.name}"

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at