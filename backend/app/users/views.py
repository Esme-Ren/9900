from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from knox.views import LoginView as KnoxLoginView, LogoutView as KnoxLogoutView
from rest_framework.authtoken.serializers import AuthTokenSerializer
from django.conf import settings
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer, ConfirmPasswordResetSerializer
from .models import UserProfile, PendingUser, PasswordResetRequest
from google.oauth2 import id_token
from google.auth.transport import requests
from teams.models import TeamMember, Team
from teams.serializers import TeamCreateSerializer
from django.shortcuts import get_object_or_404
from .utils import generate_verification_code, send_verification_email, send_password_reset_email
from django.utils import timezone
from datetime import timedelta
from admin_portal.models import EducationInteraction, ActionInteraction
from django.db import transaction
import uuid
from django.contrib.auth.hashers import make_password


### Function to initially register users into a pending user model before they are email verified
class PendingRegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Deleting existing expired pending users before creating new pending users in case they overlap
        PendingUser.objects.filter(
            created_at__lt=timezone.now() - timedelta(minutes=5)).delete()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        #Generate a code and token for main verification function
        code = generate_verification_code(6)
        token = uuid.uuid4()

        #Create pending user object
        PendingUser.objects.create(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=make_password(serializer.validated_data['password1']),
            mobile=serializer.validated_data.get('mobile', ''),
            code=code,
            token=str(token),
            agreed_terms=serializer.validated_data['agreed_terms']
        )

        #Email code to user for email verification
        send_verification_email(serializer.validated_data['email'], code)

        return Response({
            "message": "Verification code sent. Please check your email.",
            "token": str(token),
        }, status=status.HTTP_200_OK)


### Main register function which registers users if they return the correct code from their email
class RegisterView(generics.GenericAPIView, KnoxLoginView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token")
        code = request.data.get("code")
        print("Received token:", token, "code:", code)

        if not token or not code:
            print("Missing token or code")
            return Response({"error": "Token and code are required."}, status=status.HTTP_400_BAD_REQUEST)

        if not PendingUser.objects.filter(token=token).exists():
            print("PendingUser not found")
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        pending_user = PendingUser.objects.get(token=token)

        if pending_user.is_expired():
            print("PendingUser expired")
            pending_user.delete()
            return Response({"error": "Verification code has expired."}, status=status.HTTP_400_BAD_REQUEST)

        if pending_user.code != code:
            print("Code mismatch")
            return Response({"error": "Incorrect verification code."}, status=status.HTTP_400_BAD_REQUEST)

        print("Verification passed")
        # Create actual user and user profile
        user = User.objects.create_user(
            username=pending_user.username,
            email=pending_user.email,
        )

        #Save hashed password to main user model
        user.password = pending_user.password 
        user.save()

        if pending_user.mobile:
            user.userprofile.mobile = pending_user.mobile
            user.userprofile.save()

        #Login user and delete pending user model
        login(request, user)
        pending_user.delete()

        knox_response = super().post(request)
        token = knox_response.data.get("token")
        expiry = knox_response.data.get("expiry")

        if not token or not expiry:
            return Response({"error": "Token or expiry is missing in the response."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "message": "User registered and verified successfully.",
            "token": token,
            "expiry": expiry,
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


### Main login function 
class LoginView(KnoxLoginView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')

        #Error checks
        if not username or not password:
            return Response({"error": "Both username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"error": "Invalid username or password."}, status=status.HTTP_400_BAD_REQUEST)

        #Login using knox package
        login(request, user)

        knox_response = super().post(request, format=None)

        if not knox_response.data.get("token") or not knox_response.data.get("expiry"):
            return Response({"error": "Token or expiry is missing in the response."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "token": knox_response.data.get("token"),
            "expiry": knox_response.data.get("expiry"),
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

### Logout function
class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        logout(request)
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)

#Adds page to user bookmarked pages
class AddBookmarkView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        username = request.user

        #Error checks
        if username is None:
            return Response({"error": "Unauthorised."}, status=status.HTTP_401_UNAUTHORIZED)
        pageId = request.data.get('bookmark')
        if pageId is None:
            return Response({"error": "Invalid pageId. Format is {'bookmark': '<pageId>'}."}, status=status.HTTP_400_BAD_REQUEST)
        user = UserProfile.objects.get(user=username)
        if pageId not in user.bookmarks:
            user.bookmarks.append(pageId)
            user.save()

        return Response({
            'bookmarks': user.bookmarks
        }, status=status.HTTP_200_OK)


### Function to delete a user bookmark
class DeleteBookmarkView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        username = request.user

        #Error checks
        if username is None:
            return Response({"error": "Unauthorised."}, status=status.HTTP_401_UNAUTHORIZED)
        pageId = request.data.get('bookmark')
        if pageId is None:
            return Response({"error": "Invalid pageId. Format is {'bookmark': '<pageId>'}."}, status=status.HTTP_400_BAD_REQUEST)
        user = UserProfile.objects.get(user=username)
        if pageId in user.bookmarks:
            user.bookmarks.remove(pageId)
            user.save()
        else:
            return Response({"error": "Invalid pageId - bookmark is not associated with user"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'bookmarks': user.bookmarks
        }, status=status.HTTP_200_OK)

### Function to retrieve user bookmarks
class GetBookmarksView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        username = request.user

        #Error check and obtain user profile object based on username
        if username is None:
            return Response({"error": "Unauthorised."}, status=status.HTTP_401_UNAUTHORIZED)
        user = UserProfile.objects.get(user=username)

        return Response({
            'bookmarks': user.bookmarks
        }, status=status.HTTP_200_OK)


### Functions related to user profile
class UserProfileCombinedView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        username = self.kwargs.get('username')
        if username:
            return get_object_or_404(UserProfile, user__username=username)
        else:
            return self.request.user.userprofile

    # Get route - retrieve the profile
    def get(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Put route - update the profile
    def put(self, request, *args, **kwargs):
        username = self.kwargs.get('username')
        if username and username != request.user.username:
            raise PermissionDenied("You cannot update someone else's profile.")

        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

### Function to login using Google SSO backend
class GoogleLoginView(generics.GenericAPIView, KnoxLoginView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        id_token_received = request.data.get("id_token")

        if not id_token_received:
            return Response({"error": "ID token is required."}, status=status.HTTP_400_BAD_REQUEST)

        #Verify that id token from google request matches oauth2 token
        try:
            google_request = requests.Request()
            decoded_token = id_token.verify_oauth2_token(
                id_token_received, google_request, settings.GOOGLE_CLIENT_ID, 30)

            email = decoded_token.get("email")
            username = email

            user = User.objects.filter(email=email).first()
            is_new_user = False

            if not user:
                is_new_user = True
                user = User.objects.create(username=username, email=email)
                user.set_unusable_password()
                user.save()

            #Login user using knox package if successful
            login(request, user)
            knox_response = super().post(request, format=None)
            token = knox_response.data.get("token")
            expiry = knox_response.data.get("expiry")

            if not token or not expiry:
                return Response({"error": "Token or expiry is missing in the response."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
                "message": "User registered via Google successfully." if is_new_user else "User logged in via Google successfully.",
                "token": token,
                "expiry": expiry
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({"error": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST)

### Function to check if a user is an admin
class IsAdminView(generics.GenericAPIView):
    # for now, this is using the default admin perms
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        is_admin = request.user.is_staff or request.user.is_superuser
        return Response({'is_admin': is_admin})


### Function to view the teams that a user is in 
class UserTeamsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        memberships = TeamMember.objects.filter(
            user=request.user, is_pending=False)
        teams = []
        #For teams where the user is a member, append it to the list of teams and then return it
        for membership in memberships:
            teams.append({
                **TeamCreateSerializer(membership.team).data,
                'role': membership.role,
            })

        return Response({"teams": teams}, status=status.HTTP_200_OK)

### Function to see a users pending invitations
class UserInvitationsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        invitations = TeamMember.objects.filter(
            user=request.user, is_pending=True)
        pending_invitations = []
        #For teams which a user is listed as a team member that has been invited, append these teams to 
        #the list of pending_invitations, and return this list
        for invite in invitations:
            pending_invitations.append({
                **TeamCreateSerializer(invite.team).data,
                'role': invite.role,
                'invited_by': invite.invited_by.username,
            })
        return Response({"pending_invitations": pending_invitations}, status=status.HTTP_200_OK)

### Function to respond to invitations
class RespondToInvitationView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        team_id = request.data.get('team_id')
        action = request.data.get('action')

        #Users can only accept or decline
        if not team_id or action not in ['accept', 'decline']:
            return Response({"message": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)

        #See if user is a member of the given team and is also still pending
        try:
            membership = TeamMember.objects.get(
                user=request.user, team_id=team_id, is_pending=True)
        except TeamMember.DoesNotExist:
            return Response({"message": "No pending invitation found for this team."}, status=status.HTTP_404_NOT_FOUND)

        #Accept invite
        if action == 'accept':
            membership.is_pending = False
            membership.save()
            return Response({"message": "You have joined the team."}, status=status.HTTP_200_OK)

        #Decline invite
        else:
            membership.delete()
            return Response({"message": "Invitation declined."}, status=status.HTTP_200_OK)


### Function to delete a users account
class DeleteAccountView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user

        # Force users to transfer ownership of teams (or delete them) before they delete their account
        owned_teams = TeamMember.objects.filter(
            user=user, role='owner', is_pending=False)
        if owned_teams.exists():
            team_names = list(owned_teams.values_list('team__name', flat=True))
            return Response({
                "error": "Please transfer ownership or delete your teams before deleting your account.",
                "owned_teams": team_names
            }, status=status.HTTP_400_BAD_REQUEST)

        #Ensure entire block of code runs 
        with transaction.atomic():
            TeamMember.objects.filter(user=user).delete()

            # Change the page interaction entries of the user to 'none' to keep them in the database similar to unregistered user page interactions
            EducationInteraction.objects.filter(
                userId=user).update(userId=None)
            ActionInteraction.objects.filter(userId=user).update(userId=None)

            if hasattr(user, 'userprofile'):
                user.userprofile.delete()

            user.delete()

        return Response({"message": "User account has been deleted"}, status=status.HTTP_200_OK)


### Function to request password reset
class RequestPasswordResetView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # purge old
        PasswordResetRequest.objects.filter(
            updated_at__lt=timezone.now() - timedelta(minutes=15)
        ).delete()

        user = User.objects.filter(email=email).first()
        if user:
            # remove prior reqs
            PasswordResetRequest.objects.filter(user=user).delete()
            code = generate_verification_code(8, False)
            passwordRR = PasswordResetRequest.objects.create(
                user=user, code=code)
            send_password_reset_email(email, code)
            return Response({
                "message": "If that email is registered, you'll receive a reset code.",
                "token": str(passwordRR.token)
            }, status=status.HTTP_200_OK)

        return Response({"message": "If that email is registered, you'll receive a reset code."},
                        status=status.HTTP_200_OK)


### Function to verify reset code
class VerifyResetCodeView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        token = request.data.get("token")
        code = request.data.get("code")
        if not token or not code:
            return Response(
                {"error": "Both token and code are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        passwordRR = get_object_or_404(PasswordResetRequest, token=token)

        #Error checks
        if passwordRR.is_expired():
            passwordRR.delete()
            return Response({"error": "Code expired."}, status=status.HTTP_400_BAD_REQUEST)

        if passwordRR.code != code:
            return Response({"error": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        passwordRR.verified = True
        passwordRR.save()
        return Response({"message": "Code valid."}, status=status.HTTP_200_OK)

### Function to confirm password reset
class ConfirmPasswordResetView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not token or not code or not new_password:
            return Response({"error": "token, code and new_password are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        passwordRR = get_object_or_404(PasswordResetRequest, token=token)

        # must be unexpired, match code, and have been verified
        if passwordRR.is_expired() or passwordRR.code != code or not getattr(passwordRR, 'verified', False):
            passwordRR.delete()
            return Response({"error": "Invalid or expired token/code."},
                            status=status.HTTP_400_BAD_REQUEST)

        # all good → reset
        user = passwordRR.user
        user.set_password(new_password)
        user.save()
        passwordRR.delete()

        return Response({"message": "Password has been reset."},
                        status=status.HTTP_200_OK)
