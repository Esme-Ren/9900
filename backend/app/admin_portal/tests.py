from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth.models import User
from teams.models import Team, TeamMember
from sdg_education.models import EducationDb
from sdg_actions.models import ActionDb
from admin_portal.models import EducationInteraction, ActionInteraction
from sdg_action_plan.models import SDGActionPlan
from datetime import timedelta
from django.utils import timezone

class AdminPortalTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Create users
        self.admin_user = User.objects.create_superuser(username='AdminUser', email='admin@example.com', password='adminpass')
        self.user1 = User.objects.create_user(username='User1', password='user1pass')
        self.user2 = User.objects.create_user(username='User2', password='user2pass')

        # Authenticate as user1 and create team
        self.client.force_authenticate(user=self.user1)
        self.create_team_url = reverse('createTeam')
        payload = {
            "name": "Test Team",
            "description": "A team for testing",
            "invite_usernames": ["User2"]
        }
        response = self.client.post(self.create_team_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.team_id = response.data['team']['id']

        # User2 accepts invite
        self.client.force_authenticate(user=self.user2)
        respond_url = reverse('respondToInvitation')
        response = self.client.post(respond_url, {"team_id": self.team_id, "action": "accept"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Create dummy Educations
        self.education1 = EducationDb.objects.create(
            title='Education 1',
            sdgs_related=['SDG1,SDG2'],
            useful_for_which_industries=['Industry1,Industry2']
        )
        self.education2 = EducationDb.objects.create(
            title='Education 2',
            sdgs_related=['SDG3,SDG4'],
            useful_for_which_industries=['Industry3,Industry4']
        )

        # Create dummy Actions
        self.action1 = ActionDb.objects.create(
            actions='Action 1',
            sdgs=['SDG5,SDG6'],
            related_industry=['Industry5,Industry6']
        )
        self.action2 = ActionDb.objects.create(
            actions='Action 2',
            sdgs=['SDG7,SDG8'],
            related_industry=['Industry7,Industry8']
        )

        # Log interactions for later testing
        self.client.force_authenticate(user=self.user1)
        self.education_interaction_url = reverse('logEducationInteraction')
        self.action_interaction_url = reverse('logActionInteraction')
        self.client.post(self.education_interaction_url, {'educationId': self.education1.id}, format='json')
        self.client.post(self.action_interaction_url, {'actionId': self.action1.id}, format='json')

    def authenticate_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)

    ### Admin User & Team Management Tests 

    def test_admin_user_list_success(self):
        self.authenticate_as_admin()
        url = reverse('adminUserList')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(user['username'] == 'User1' for user in response.data))

    def test_admin_team_list_success(self):
        self.authenticate_as_admin()
        url = reverse('adminTeamList')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(team['id'] == self.team_id for team in response.data))

    def test_admin_team_members_success(self):
        self.authenticate_as_admin()
        url = reverse('adminTeamMembers', kwargs={'team_id': self.team_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('members' in response.data)

    def test_admin_team_members_team_not_found(self):
        self.authenticate_as_admin()
        url = reverse('adminTeamMembers', kwargs={'team_id': 9999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_kick_member_success(self):
        self.authenticate_as_admin()
        url = reverse('adminTeamKick', kwargs={'team_id': self.team_id})
        response = self.client.post(url, {'username': 'User2'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('was removed from the team', response.data['message'])

    def test_admin_kick_member_not_found(self):
        self.authenticate_as_admin()
        url = reverse('adminTeamKick', kwargs={'team_id': self.team_id})
        response = self.client.post(url, {'username': 'FakeUser'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_update_role_success(self):
        self.authenticate_as_admin()
        url = reverse('adminTeamUpdateRole', kwargs={'team_id': self.team_id})
        response = self.client.post(url, {'username': 'User2', 'new_role': 'admin'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('changed to admin', response.data['message'])

    def test_admin_update_role_invalid_role(self):
        self.authenticate_as_admin()
        url = reverse('adminTeamUpdateRole', kwargs={'team_id': self.team_id})
        response = self.client.post(url, {'username': 'User2', 'new_role': 'invalidrole'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    ### Interaction Logging Tests

    def test_log_education_interaction(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.education_interaction_url, {'educationId': self.education2.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['educationName'], 'Education 2')

    def test_log_action_interaction(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.action_interaction_url, {'actionId': self.action2.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['actionName'], 'Action 2')

    ### View Counts and Analytics Tests 

    def test_education_view_count(self):
        self.authenticate_as_admin()
        url = reverse('educationViewCount', kwargs={'education_id': self.education1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_views'], 1)

    def test_action_view_count(self):
        self.authenticate_as_admin()
        url = reverse('actionViewCount', kwargs={'action_id': self.action1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_views'], 1)

    def test_user_interactions(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('userInteractions', kwargs={'user_id': self.user1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('education_pages_viewed', response.data)
        self.assertIn('action_plans_viewed', response.data)

    def test_top_educations(self):
        url = reverse('topEducations')
        response = self.client.post(url, {'time_range': 'all time'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(edu['educationName'] == 'Education 1' for edu in response.data))

    def test_top_actions(self):
        url = reverse('topActions')
        response = self.client.post(url, {'time_range': 'all time'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(action['actionName'] == 'Action 1' for action in response.data))

    def test_top_education_sdgs(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('topEducationSdgs')
        response = self.client.post(url, {'time_range': 'all time'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item['sdg'] in ['SDG1', 'SDG2'] for item in response.data))

    def test_top_action_sdgs(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('topActionSdgs')
        response = self.client.post(url, {'time_range': 'all time'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item['sdg'] in ['SDG5', 'SDG6'] for item in response.data))

    ### SDG Plan Tests 

    def test_get_sdg_plans(self):
        self.authenticate_as_admin()
        url = reverse('allSDGPlans')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_sdg_plans_count(self):
        url = reverse('allSDGPlansCount')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_count', response.data)