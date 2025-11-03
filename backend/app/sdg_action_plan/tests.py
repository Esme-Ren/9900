from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import SDGActionPlan
# adjust import based on your project structure
from teams.models import Team, TeamMember


class SDGActionPlanAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpassword")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # make team with user
        self.team = Team.objects.create(name="Test Team")
        TeamMember.objects.create(
            user=self.user,
            team=self.team,
            role="member",
            is_pending=False,
            invited_by=self.user
        )

        self.list_url = reverse('action-plan-list')
        self.create_url = reverse('action-plan-create')

    def test_create_action_plan(self):
        """Test that an authenticated user can create an action plan with the minimal required fields."""
        payload = {
            "impact_project_name": "Project Impact",
            "team": self.team.id,
            "plan_content": {}
        }
        response = self.client.post(self.create_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["impact_project_name"], payload["impact_project_name"])
        self.assertEqual(response.data["team"], self.team.id)
        # Check that the action plan is assigned to the test user
        self.assertEqual(response.data["user"], self.user.id)

    def test_list_action_plans(self):
        """Test that listing action plans returns only those for teams the user belongs to."""
        # create two action plans for our test team
        SDGActionPlan.objects.create(
            user=self.user,
            impact_project_name="Project Impact 1",
            plan_content={},
            team=self.team
        )
        SDGActionPlan.objects.create(
            user=self.user,
            impact_project_name="Project Impact 2",
            plan_content={},
            team=self.team
        )
        response = self.client.get(self.list_url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_action_plan(self):
        """Test retrieving a single action plan."""
        action_plan = SDGActionPlan.objects.create(
            user=self.user,
            impact_project_name="Project Impact Retrieve",
            plan_content={},
            team=self.team
        )
        detail_url = reverse('action-plan-retrieve',
                             kwargs={'id': action_plan.id})
        response = self.client.get(detail_url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["impact_project_name"], action_plan.impact_project_name)

    def test_update_action_plan(self):
        """Test updating an action plan."""
        action_plan = SDGActionPlan.objects.create(
            user=self.user,
            impact_project_name="Original Project Impact",
            plan_content={},
            team=self.team
        )
        detail_url = reverse('action-plan-update',
                             kwargs={'id': action_plan.id})
        payload = {
            "impact_project_name": "Updated Impact Project",
            "team": self.team.id,
            "plan_content": {}
        }
        response = self.client.put(detail_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["impact_project_name"], payload["impact_project_name"])
        self.assertEqual(response.data["team"], self.team.id)

    def test_delete_action_plan(self):
        """Test deleting an action plan."""
        action_plan = SDGActionPlan.objects.create(
            user=self.user,
            impact_project_name="Project Impact to Delete",
            plan_content={},
            team=self.team
        )
        detail_url = reverse('action-plan-delete',
                             kwargs={'id': action_plan.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(SDGActionPlan.objects.filter(
            id=action_plan.id).exists())

    def test_team_member_can_view_shared_action_plan(self):
        """Test that a user who is a member of the same team (but not the creator) can view shared action plans."""
        # Create a second user and add them to the same team
        user2 = User.objects.create_user(
            username="user2", password="testpassword")
        TeamMember.objects.create(
            user=user2,
            team=self.team,
            role="member",
            is_pending=False,
            invited_by=self.user
        )
        # Create an action plan by primary user
        action_plan = SDGActionPlan.objects.create(
            user=self.user,
            impact_project_name="Shared Action Plan",
            plan_content={},
            team=self.team
        )
        self.client.force_authenticate(user=user2)
        # Test list view
        list_url = reverse('action-plan-list')
        response = self.client.get(list_url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        # Test retrieve view
        detail_url = reverse('action-plan-retrieve',
                             kwargs={'id': action_plan.id})
        response = self.client.get(detail_url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["impact_project_name"], action_plan.impact_project_name)

    def test_non_team_member_cannot_view_shared_action_plan(self):
        """Test that a user who is not a member of the team cannot view that team's action plan."""
        # Create a third user who is NOT part of the team
        user3 = User.objects.create_user(
            username="user3", password="testpassword")
        # Create an action plan by primary user in the team
        action_plan = SDGActionPlan.objects.create(
            user=self.user,
            impact_project_name="Shared Action Plan",
            plan_content={},
            team=self.team
        )
        # Authenticate as the third user
        self.client.force_authenticate(user=user3)
        list_url = reverse('action-plan-list')
        response = self.client.get(list_url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Expect no shared action plans visible to user3
        self.assertEqual(len(response.data), 0)

    def test_team_member_can_update_shared_action_plan(self):
        """Test that a user who is a member of the same team (but not the creator) can update a shared action plan."""
        # Create a second user and add them to the same team
        user2 = User.objects.create_user(
            username="user2", password="testpassword")
        TeamMember.objects.create(
            user=user2,
            team=self.team,
            role="member",
            is_pending=False,
            invited_by=self.user
        )
        # Create an action plan by the primary user
        action_plan = SDGActionPlan.objects.create(
            user=self.user,
            impact_project_name="Shared Action Plan",
            plan_content={},
            team=self.team
        )
        # Authenticate as the team member (user2)
        self.client.force_authenticate(user=user2)
        detail_url = reverse('action-plan-update',
                             kwargs={'id': action_plan.id})
        payload = {
            "impact_project_name": "Updated by Team Member",
            "team": self.team.id,
            "plan_content": {}
        }
        response = self.client.put(detail_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["impact_project_name"], payload["impact_project_name"])
        self.assertEqual(response.data["team"], self.team.id)

    def test_non_team_member_cannot_update_shared_action_plan(self):
        """Test that a user who is not a member of the team cannot update a shared action plan."""
        # Create an action plan by the primary user in the team
        action_plan = SDGActionPlan.objects.create(
            user=self.user,
            impact_project_name="Shared Action Plan",
            plan_content={},
            team=self.team
        )
        # Create a fourth user who is NOT part of the team
        user4 = User.objects.create_user(
            username="user4", password="testpassword")
        # Authenticate as the fourth user
        self.client.force_authenticate(user=user4)
        detail_url = reverse('action-plan-update',
                             kwargs={'id': action_plan.id})
        payload = {
            "impact_project_name": "Attempted Update by Non-Team Member",
            "team": self.team.id,
            "plan_content": {}
        }
        response = self.client.put(detail_url, payload, format="json")
        # Since user4 is not allowed to update (object is not in their queryset), they should receive a 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
