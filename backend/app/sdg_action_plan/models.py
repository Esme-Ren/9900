from django.db import models
from django.contrib.auth.models import User
from teams.models import Team


class SDGActionPlan(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('final', 'Final'),
    ]

    # make sure to use empty string for blank fields in the database
    # only things that need to be filled out on creation is impact_project_name and team
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='action_plans')
    name_of_designers = models.TextField(blank=True)
    impact_project_name = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    plan_content = models.JSONField(default=dict)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # store the path or url of the generated pdf
    pdf_file_path = models.CharField(max_length=255, blank=True, null=True)

    # each action plan only belongs to one team
    team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name='action_plans')

    editors = models.ManyToManyField(
        User, related_name='editable_action_plans', blank=True)
    
    # 新增权限控制字段
    viewers = models.ManyToManyField(
        User, related_name='viewable_action_plans', blank=True)
    
    # 权限控制设置
    allow_team_edit = models.BooleanField(default=True, help_text="允许团队成员编辑")
    allow_team_view = models.BooleanField(default=True, help_text="允许团队成员查看")
    require_explicit_permissions = models.BooleanField(default=False, help_text="需要明确权限设置")

    
    # Google Docs integration fields
    google_doc_id = models.CharField(max_length=255, blank=True, null=True, 
                                   help_text='Google Docs document ID')
    google_doc_url = models.URLField(blank=True, null=True,
                                   help_text='Direct link to Google Docs document')
    google_doc_created = models.BooleanField(default=False,
                                           help_text='Whether Google Docs document has been created')
    last_sync_time = models.DateTimeField(blank=True, null=True,
                                        help_text='Last time content was synced to Google Docs')
    def __str__(self):
        return f"Action Plan: {self.impact_project_name} by {self.user.username}"
