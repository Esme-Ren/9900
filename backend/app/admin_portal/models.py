from django.db import models
from django.contrib.auth.models import User
from sdg_education.models import EducationDb
from sdg_actions.models import ActionDb

# Model for global settings
class GlobalSettings(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_setting(cls, key, default=None):
        try:
            setting = cls.objects.get(key=key)
            return setting.value
        except cls.DoesNotExist:
            return default

    def __str__(self):
        return f"{self.key}: {self.value}"

#Model for interactions between users and education pages
class EducationInteraction(models.Model):
    userId = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    educationId = models.ForeignKey(EducationDb, on_delete=models.CASCADE)
    educationName = models.TextField()

    related_sdgs = models.TextField(null=True, blank=True)
    related_disciplines = models.TextField(null=True, blank=True)
    related_industries = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["educationId", "userId"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.userId or 'Anonymous'} viewed Education {self.educationId.id}"

#Model for interactions between users and action pages
class ActionInteraction(models.Model):
    userId = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    actionId = models.ForeignKey(ActionDb, on_delete=models.CASCADE)
    actionName = models.TextField()

    related_sdgs = models.TextField(null=True, blank=True)
    related_industries = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["actionId", "userId"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        return f"{self.userId or 'Anonymous'} viewed Action {self.actionId.id}"

# Model for tracking user search history
class UserSearchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    search_query = models.TextField()
    search_type = models.CharField(max_length=50, choices=[
        ('action', 'SDG Action'),
        ('education', 'SDG Education'),
        ('keyword', 'SDG Keyword'),
        ('general', 'General Search')
    ])
    timestamp = models.DateTimeField(auto_now_add=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        indexes = [
            models.Index(fields=["user", "timestamp"]),
            models.Index(fields=["search_type", "timestamp"]),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user or 'Anonymous'} searched '{self.search_query}' at {self.timestamp}"

# Model for tracking user page visits and activity
class UserPageActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    page_url = models.CharField(max_length=500)
    page_title = models.CharField(max_length=200)
    time_spent = models.IntegerField(default=0)  # in seconds
    visit_count = models.IntegerField(default=1)
    first_visit = models.DateTimeField(auto_now_add=True)
    last_visit = models.DateTimeField(auto_now=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        indexes = [
            models.Index(fields=["user", "last_visit"]),
            models.Index(fields=["page_url", "last_visit"]),
        ]
        unique_together = ['user', 'page_url']

    def __str__(self):
        return f"{self.user or 'Anonymous'} visited {self.page_title}"

# Model for tracking SDG form activity
class SDGFormActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    form = models.ForeignKey('sdg_action_plan.SDGActionPlan', on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=50, choices=[
        ('view', 'View Form'),
        ('edit', 'Edit Form'),
        ('save', 'Save Form'),
        ('submit', 'Submit Form'),
        ('export', 'Export Form')
    ])
    field_name = models.CharField(max_length=100, blank=True, null=True)
    content_length = models.IntegerField(default=0)  # character count
    timestamp = models.DateTimeField(auto_now_add=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        indexes = [
            models.Index(fields=["user", "form", "timestamp"]),
            models.Index(fields=["activity_type", "timestamp"]),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} {self.activity_type} form {self.form.id}"

# Model for tracking user browser activity
class UserBrowserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    activity_type = models.CharField(max_length=50, choices=[
        ('page_load', 'Page Load'),
        ('click', 'Click'),
        ('scroll', 'Scroll'),
        ('form_input', 'Form Input'),
        ('navigation', 'Navigation')
    ])
    element_id = models.CharField(max_length=500, blank=True, null=True)
    element_type = models.CharField(max_length=50, blank=True, null=True)
    page_url = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=["user", "timestamp"]),
            models.Index(fields=["activity_type", "timestamp"]),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user or 'Anonymous'} {self.activity_type} at {self.timestamp}"

