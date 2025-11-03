from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, PendingUser
import re


class UserSerializer(serializers.ModelSerializer):
    mobile = serializers.CharField(
        source='userprofile.mobile', allow_blank=True, allow_null=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'mobile']


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    mobile = serializers.CharField(required=False, allow_blank=True)
    agreed_terms = serializers.BooleanField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', 'mobile', 'agreed_terms')

    # Checks for password matching and duplicate username/email/mobile entries to database
    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError("Passwords do not match.")

        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError("Username is already taken.")

        # Users can't register with a username that another pending user is using, unless that pending user is themselves (same email)
        if PendingUser.objects.filter(username=attrs['username']).exclude(email=attrs['email']).exists():
            raise serializers.ValidationError("Username is already taken.")

        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("Email is already in use.")

        if 'mobile' in attrs and attrs['mobile']:
            if UserProfile.objects.filter(mobile=attrs['mobile']).exists():
                raise serializers.ValidationError(
                    "Mobile number already in use.")

        if not attrs.get('agreed_terms', False):
            raise serializers.ValidationError("You must agree to the Terms and Conditions.")

        return attrs

    # Strong password validation checks
    def validate_password1(self, password):
        if len(password) < 10 or len(password) > 31:
            raise serializers.ValidationError(
                "Password must be between 10 and 31 characters long.")
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError(
                "Password must contain at least one lowercase letter.")
        if not re.search(r'\d', password):
            raise serializers.ValidationError(
                "Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise serializers.ValidationError(
                "Password must contain at least one special character.")
        return password

    def validate_mobile(self, mobile):
        if mobile and not re.fullmatch(r'^\d{10}$', mobile):
            raise serializers.ValidationError(
                "Mobile number must be exactly 10 digits.")
        return mobile

    # Check to see if email is valid format (a@b.c)

    def validate_email(self, email):
        if not re.fullmatch(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            raise serializers.ValidationError("Invalid email format.")
        return email

    # Username field validation checks
    def validate_username(self, username):
        if len(username) < 4 or len(username) > 31:
            raise serializers.ValidationError(
                "Username must be between 4 and 31 characters long.")
        if not re.match(r'^[a-zA-Z0-9 ]+$', username):
            raise serializers.ValidationError(
                "Username cannot contain special characters.")
        if username.startswith(" ") or username.endswith(" "):
            raise serializers.ValidationError(
                "Username cannot start or end with a space.")
        return username

### Profile serializer
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', required=True)
    first_name = serializers.CharField(
        source='user.first_name', allow_blank=True, allow_null=True, required=False)
    last_name = serializers.CharField(
        source='user.last_name', allow_blank=True, allow_null=True, required=False)
    mobile = serializers.CharField(
        allow_blank=True, allow_null=True, required=False)
    organization = serializers.CharField(
        allow_blank=True, allow_null=True, required=False)
    faculty_and_major = serializers.CharField(
        allow_blank=True, allow_null=True, required=False)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'first_name', 'last_name', 'mobile',
                  'organization', 'faculty_and_major']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        user.email = user_data.get('email', user.email)
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.save()

        instance.mobile = validated_data.get('mobile', instance.mobile)
        instance.organization = validated_data.get(
            'organization', instance.organization)
        instance.faculty_and_major = validated_data.get(
            'faculty_and_major', instance.faculty_and_major)
        instance.save()

        return instance

class ConfirmPasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
