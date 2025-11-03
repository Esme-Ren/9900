from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import models
from django_mysql.models import ListCharField
import uuid
from datetime import timedelta
from django.utils import timezone

### User profile model
class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='userprofile')
    mobile = models.CharField(max_length=10, null=False, blank=False)
    organization = models.CharField(max_length=255, blank=True, null=True)
    faculty_and_major = models.CharField(max_length=255, blank=True, null=True)
    bookmarks = ListCharField(
        base_field=models.CharField(max_length=20),
        size=255,
        max_length=(255*21),  # 255 * 20 character bookmarks ids, plus commas
        default=[]
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"

# Automatically create user profile when a user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()

### Pending user model before email is confirmed
class PendingUser(models.Model):
   
    token = models.CharField(max_length=36, unique=True)
    username = models.CharField(max_length=150)
    email = models.EmailField()
    password = models.CharField(max_length=128)
    mobile = models.CharField(max_length=10, blank=True, null=True)
    code = models.CharField(max_length=8)
    created_at = models.DateTimeField(auto_now_add=True)
    agreed_terms = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5)

### Password Reset Request Model
class PasswordResetRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    code = models.CharField(max_length=8)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_expired(self):
        return timezone.now() > self.updated_at + timedelta(minutes=15)
