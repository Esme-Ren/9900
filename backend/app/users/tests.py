from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import UserProfile, PendingUser, PasswordResetRequest
from .serializers import ProfileSerializer
from teams.models import Team, TeamMember
from unittest.mock import patch
from django.utils import timezone
from datetime import timedelta

### Registration and Authentication Tests 

class RegistrationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.pending_register_url = reverse('pendingRegister')
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.google_login_url = reverse('googleLogin')

        # Create existing user for duplicate tests
        self.existing_user = User.objects.create_user(username='ExistingUser', email='existing@example.com', password='Password1234!')

    def test_pending_registration_success(self):
        data = {
            'username': 'TestUser1',
            'email': 'testuser1@example.com',
            'password1': 'TestPassword1234!',
            'password2': 'TestPassword1234!',
            'mobile': '1234567890'
        }
        response = self.client.post(self.pending_register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_pending_registration_password_mismatch(self):
        # Test password mismatch during pending registration
        data = {
            'username': 'TestUser2',
            'email': 'testuser2@example.com',
            'password1': 'TestPassword1234!',
            'password2': 'MismatchPassword!',
            'mobile': '1234567890'
        }
        response = self.client.post(self.pending_register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_success_after_pending(self):
        # Test successful registration after pending step
        pending_data = {
            'username': 'TestUser3',
            'email': 'testuser3@example.com',
            'password1': 'TestPassword1234!',
            'password2': 'TestPassword1234!',
            'mobile': '1234567890'
        }
        pending_response = self.client.post(self.pending_register_url, pending_data, format='json')
        token = pending_response.data['token']
        pending_user = PendingUser.objects.get(username='TestUser3')
        register_data = {
            'token': token,
            'code': pending_user.code
        }
        register_response = self.client.post(self.register_url, register_data, format='json')
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

    @patch('users.views.id_token.verify_oauth2_token')
    def test_google_login_success(self, mock_verify):
        # Test Google login success
        mock_verify.return_value = {'email': 'googleuser@example.com'}
        response = self.client.post(self.google_login_url, {'id_token': 'mocktoken'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_pending_registration_username_already_exists(self):
        data = {
            'username': 'ExistingUser',  # duplicate username
            'email': 'newemail@example.com',
            'password1': 'NewPassword1234!',
            'password2': 'NewPassword1234!',
            'mobile': '1234567890'
        }
        response = self.client.post(self.pending_register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pending_registration_email_already_exists(self):
        data = {
            'username': 'NewUser',
            'email': 'existing@example.com',  # duplicate email
            'password1': 'NewPassword1234!',
            'password2': 'NewPassword1234!',
            'mobile': '1234567890'
        }
        response = self.client.post(self.pending_register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pending_registration_invalid_mobile_format(self):
        data = {
            'username': 'NewUser',
            'email': 'newuser@example.com',
            'password1': 'NewPassword1234!',
            'password2': 'NewPassword1234!',
            'mobile': 'invalid-phone'
        }
        response = self.client.post(self.pending_register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_invalid_token_or_code(self):
        pending_data = {
            'username': 'TestUserX',
            'email': 'testuserx@example.com',
            'password1': 'TestPassword1234!',
            'password2': 'TestPassword1234!',
            'mobile': '1234567890'
        }
        pending_response = self.client.post(self.pending_register_url, pending_data, format='json')
        token = pending_response.data['token']

        # Wrong code
        register_data = {
            'token': token,
            'code': 'WRONGCODE'
        }
        register_response = self.client.post(self.register_url, register_data, format='json')
        self.assertEqual(register_response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('users.views.id_token.verify_oauth2_token')
    def test_google_login_success(self, mock_verify):
        ...

    @patch('users.views.id_token.verify_oauth2_token')
    def test_google_login_invalid_token(self, mock_verify):
        mock_verify.side_effect = ValueError('Invalid Token')
        response = self.client.post(self.google_login_url, {'id_token': 'badtoken'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pending_registration_no_mobile(self):
        """ Test pending registration when no mobile is provided """
        data = {
            'username': 'TestUserNoMobile',
            'email': 'testusermobile@example.com',
            'password1': 'TestPassword1234!',
            'password2': 'TestPassword1234!',
            # mobile is missing
        }
        response = self.client.post(self.pending_register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_registration_missing_token_or_code(self):
        """ Test registration failure when token or code is missing """
        register_data = {
            # 'token': 'some-token',  # missing
            'code': 'some-code'
        }
        response = self.client.post(self.register_url, register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

### User Profile Tests 

class UserProfileViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='TestUser', password='TestPassword1234!', email='testuser@example.com')
        self.user2 = User.objects.create_user(username='TestUser2', password='TestPassword1234!', email='testuser2@example.com')
        self.client.force_authenticate(user=self.user1)
        self.own_profile_url = reverse('profile-get')
        self.other_profile_url = reverse('profile-detail', kwargs={'username': self.user2.username})
        self.admin_check_url = reverse('adminCheck')

    def test_get_own_profile(self):
        response = self.client.get(self.own_profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_other_profile(self):
        response = self.client.get(self.other_profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_update_own_profile(self):
        update_data = {
            "email": "newtestuser@example.com",
            "first_name": "First",
            "last_name": "Last",
            "mobile": "1234567890",
            "organization": "New Org",
            "faculty_and_major": "New Faculty"
        }
        response = self.client.put(self.own_profile_url, data=update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_put_update_other_profile_forbidden(self):
        update_data = {"email": "sus@example.com"}
        response = self.client.put(self.other_profile_url, data=update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_check(self):
        response = self.client.get(self.admin_check_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'is_admin': False})

### Bookmark Tests 

class BookmarkTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='BookmarkUser', password='TestPassword1234!', email='bookmarkuser@example.com')
        self.client.force_authenticate(user=self.user)
        self.add_url = reverse('setBookmark')
        self.remove_url = reverse('unsetBookmark')
        self.get_url = reverse('getBookmarks')

    def test_add_and_remove_bookmark(self):
        response = self.client.post(self.add_url, {'bookmark': 'page123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.post(self.remove_url, {'bookmark': 'page123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_add_bookmark_invalid(self):
        response = self.client.post(self.add_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

### Team and Invitation Tests 

class TeamAndInvitationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username='OwnerUser', password='TestPassword1234!', email='owneruser@example.com')
        self.member = User.objects.create_user(username='MemberUser', password='TestPassword1234!', email='memberuser@example.com')

        self.client.force_authenticate(user=self.owner)
        
        # Create team
        create_team_url = '/api/teams/create/' 
        team_data = {"name": "TeamOne", "description": "Test team.", "invite_usernames": []}
        response = self.client.post(create_team_url, team_data, format='json')
        self.assertEqual(response.status_code, 201)
        self.team_id = response.data['team']['id']

        # Invite member
        invite_url = f'/api/teams/{self.team_id}/invite/' 
        self.client.post(invite_url, {'usernames': ['MemberUser']}, format='json')

    def test_view_invitations(self):
        self.client.force_authenticate(user=self.member)
        invitations_url = reverse('userInvitations')  
        response = self.client.get(invitations_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_accept_invitation(self):
        self.client.force_authenticate(user=self.member)
        respond_url = reverse('respondToInvitation')  
        response = self.client.post(respond_url, {'team_id': self.team_id, 'action': 'accept'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_decline_invitation(self):
        self.client.force_authenticate(user=self.member)
        respond_url = reverse('respondToInvitation')
        response = self.client.post(respond_url, {'team_id': self.team_id, 'action': 'decline'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_action_on_invitation(self):
        self.client.force_authenticate(user=self.member)
        respond_url = reverse('respondToInvitation')
        response = self.client.post(respond_url, {'team_id': self.team_id, 'action': 'maybe'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_view_teams_after_acceptance(self):
        self.client.force_authenticate(user=self.member)
        respond_url = reverse('respondToInvitation')
        self.client.post(respond_url, {'team_id': self.team_id, 'action': 'accept'})
        teams_url = reverse('userTeams')
        response = self.client.get(teams_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_accept_invitation_no_membership(self):
        self.client.force_authenticate(user=self.member)
        respond_url = reverse('respondToInvitation')
        # Delete the invitation manually
        TeamMember.objects.filter(team_id=self.team_id, user=self.member).delete()
        response = self.client.post(respond_url, {'team_id': self.team_id, 'action': 'accept'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


### Account Deletion Tests 

class AccountDeletionTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='DeleteUser', password='TestPassword1234!', email='deleteuser@example.com')
        self.client.force_authenticate(user=self.user)

        # Create team owned by the user
        create_team_url = '/api/teams/create/'
        team_data = {"name": "TeamOwned", "description": "Owned team.", "invite_usernames": []}
        response = self.client.post(create_team_url, team_data, format='json')
        self.assertEqual(response.status_code, 201)

    def test_delete_account_success(self):
        # First, leave the team to allow deletion
        teams = TeamMember.objects.filter(user=self.user, role='owner', is_pending=False)
        for team in teams:
            team.delete()

        delete_account_url = reverse('deleteAccount')
        response = self.client.delete(delete_account_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_account_fail_due_to_owned_team(self):
        delete_account_url = reverse('deleteAccount')
        response = self.client.delete(delete_account_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('owned_teams', response.data)

### Password Reset Tests

class PasswordResetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='ResetUser', password='TestPassword1234!', email='resetuser@example.com')
        self.verify_url = reverse('passwordResetVerify')

    def test_request_password_reset(self):
        request_url = reverse('passwordResetRequest')
        response = self.client.post(request_url, {'email': self.user.email}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_confirm_password_reset(self):
        request_url = reverse('passwordResetRequest')
        self.client.post(request_url, {'email': self.user.email}, format='json')

        password_rr = PasswordResetRequest.objects.filter(user=self.user).first()
        password_rr.verified = True
        password_rr.save()

        confirm_url = reverse('passwordResetConfirm')
        response = self.client.post(confirm_url, {
            'token': str(password_rr.token),
            'code': password_rr.code,
            'new_password': 'NewPassword1234!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_password_reset_request_nonexistent_email(self):
        request_url = reverse('passwordResetRequest')
        response = self.client.post(request_url, {'email': 'nonexistent@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)  

    def test_verify_reset_code_success(self):
        password_rr = PasswordResetRequest.objects.create(user=self.user, code='ABC123')
        response = self.client.post(self.verify_url, {
            'token': str(password_rr.token),
            'code': 'ABC123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Code valid.')

    def test_verify_reset_code_missing_fields(self):
        password_rr = PasswordResetRequest.objects.create(user=self.user, code='ABC123')
        response = self.client.post(self.verify_url, {
            'token': str(password_rr.token)
            # Missing code
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_reset_code_invalid_code(self):
        password_rr = PasswordResetRequest.objects.create(user=self.user, code='ABC123')
        response = self.client.post(self.verify_url, {
            'token': str(password_rr.token),
            'code': 'WRONGCODE'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

### isAdmin tests
class IsAdminTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.normal_user = User.objects.create_user(username='NormalUser', password='password')
        self.admin_user = User.objects.create_superuser(username='AdminUser', password='password', email='admin@example.com')
        self.url = reverse('adminCheck')

    def test_normal_user_is_not_admin(self):
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_admin'], False)

    def test_admin_user_is_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_admin'], True)