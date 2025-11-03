from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User
from teams.models import Team, TeamMember

class TeamsAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # Create three users
        self.user1 = User.objects.create_user(username='User1', password='password')
        self.user2 = User.objects.create_user(username='User2', password='password')
        self.user3 = User.objects.create_user(username='User3', password='password')
        self.client.force_authenticate(user=self.user1)
        self.create_team_url = reverse('createTeam')
        self.users_list_url = reverse('usersList')

    # Create Team

    def test_create_team_success_and_invite(self):
        payload = {
            "name": "Awesome Team",
            "description": "Team Description",
            "invite_usernames": ["User2"]
        }
        response = self.client.post(self.create_team_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['team']['name'], payload['name'])

    def test_create_team_missing_fields(self):
        payload = {"description": "Missing name"}
        response = self.client.post(self.create_team_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # View Team

    def test_view_team_success(self):
        team = Team.objects.create(name="Test Team")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        url = reverse('getTeam', kwargs={"team_id": team.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_view_team_not_found(self):
        url = reverse('getTeam', kwargs={"team_id": 999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # View Team Members

    def test_view_team_members_success(self):
        team = Team.objects.create(name="Member Team")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        url = reverse('teamMembers', kwargs={"team_id": team.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_view_team_members_not_member(self):
        team = Team.objects.create(name="Hidden Team")
        url = reverse('teamMembers', kwargs={"team_id": team.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_view_team_members_team_not_found(self):
        url = reverse('teamMembers', kwargs={"team_id": 999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # User Role

    def test_get_user_role_success(self):
        team = Team.objects.create(name="Role Team")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        url = reverse('getRole', kwargs={"team_id": team.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'owner')

    def test_get_user_role_not_member(self):
        team = Team.objects.create(name="Non Member Role")
        url = reverse('getRole', kwargs={"team_id": team.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_user_role_team_not_found(self):
        url = reverse('getRole', kwargs={"team_id": 999})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Promote, Transfer Ownership, Invalid Updates

    def test_promote_member_to_admin(self):
        team = Team.objects.create(name="Promotion Team")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        TeamMember.objects.create(user=self.user2, team=team, role='member', is_pending=False)
        url = reverse('updateTeamMemberRole', kwargs={"team_id": team.id})
        response = self.client.post(url, {"username": "User2", "new_role": "admin"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_owner_transfer_ownership(self):
        team = Team.objects.create(name="Ownership Team")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        TeamMember.objects.create(user=self.user2, team=team, role='admin', is_pending=False)
        url = reverse('updateTeamMemberRole', kwargs={"team_id": team.id})
        response = self.client.post(url, {"username": "User2", "new_role": "owner"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_role_update(self):
        team = Team.objects.create(name="Invalid Role Team")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        TeamMember.objects.create(user=self.user2, team=team, role='member', is_pending=False)
        url = reverse('updateTeamMemberRole', kwargs={"team_id": team.id})
        response = self.client.post(url, {"username": "User2", "new_role": "invalidrole"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Update Invite Permissions

    def test_update_invite_permissions_success(self):
        team = Team.objects.create(name="Invite Perms")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        TeamMember.objects.create(user=self.user2, team=team, role='member', is_pending=False)
        url = reverse('updateInvitePermissions', kwargs={"team_id": team.id})
        response = self.client.post(url, {"username": "User2", "can_invite": True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_invite_permissions_missing_field(self):
        team = Team.objects.create(name="Invite Perms Error")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        TeamMember.objects.create(user=self.user2, team=team, role='member', is_pending=False)
        url = reverse('updateInvitePermissions', kwargs={"team_id": team.id})
        response = self.client.post(url, {"username": "User2"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Kick Members

    def test_kick_member_success(self):
        team = Team.objects.create(name="Kick Team")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        TeamMember.objects.create(user=self.user2, team=team, role='member', is_pending=False)
        url = reverse('kickTeamMember', kwargs={"team_id": team.id})
        response = self.client.post(url, {"username": "User2"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_kick_member_no_permission(self):
        team = Team.objects.create(name="Kick Fail")
        TeamMember.objects.create(user=self.user1, team=team, role='member', is_pending=False)
        TeamMember.objects.create(user=self.user2, team=team, role='member', is_pending=False)
        url = reverse('kickTeamMember', kwargs={"team_id": team.id})
        response = self.client.post(url, {"username": "User2"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Leave Team

    def test_leave_team_success(self):
        team = Team.objects.create(name="Leave Team")
        TeamMember.objects.create(user=self.user1, team=team, role='admin', is_pending=False)
        url = reverse('leaveTeam', kwargs={"team_id": team.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_leave_team_owner_forbidden(self):
        team = Team.objects.create(name="Owner Leave")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        url = reverse('leaveTeam', kwargs={"team_id": team.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Delete Team

    def test_delete_team_success(self):
        team = Team.objects.create(name="Delete Team")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        url = reverse('deleteTeam', kwargs={"team_id": team.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_team_not_owner(self):
        team = Team.objects.create(name="Non Owner Delete")
        TeamMember.objects.create(user=self.user1, team=team, role='admin', is_pending=False)
        url = reverse('deleteTeam', kwargs={"team_id": team.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Invite Members

    def test_invite_user_success(self):
        team = Team.objects.create(name="Invite Members")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        url = reverse('inviteMembers', kwargs={"team_id": team.id})
        response = self.client.post(url, {"usernames": ["User2"]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invite_invalid_payload(self):
        team = Team.objects.create(name="Bad Invite")
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        url = reverse('inviteMembers', kwargs={"team_id": team.id})
        response = self.client.post(url, {"usernames": "NotAList"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Users View

    def test_list_users_no_team_id(self):
        url = self.users_list_url
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_users_with_team_id(self):
        team = Team.objects.create(name="Filter Team")
        TeamMember.objects.create(user=self.user2, team=team, role='member', is_pending=False)
        TeamMember.objects.create(user=self.user1, team=team, role='owner', is_pending=False)
        url = self.users_list_url
        response = self.client.get(url, HTTP_TEAM_ID=str(team.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)