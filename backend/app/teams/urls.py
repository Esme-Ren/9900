from django.urls import path
from .views import (
    CreateTeamView,
    TeamView,
    DeleteTeamView,
    TeamMembersView,
    UserRoleView,
    UpdateTeamRoleView,
    KickMemberView,
    LeaveTeamView,
    UpdateInvitePermissionsView,
    InviteMembersView,
    UsersView,
    EmailInviteView,
    AcceptEmailInvitationView,
    UpdateTeamMaxMembersView,
)

urlpatterns = [
    path('create/', CreateTeamView.as_view(), name='createTeam'),
    path('<int:team_id>/', TeamView.as_view(), name='getTeam'),
    path('<int:team_id>/delete/', DeleteTeamView.as_view(), name='deleteTeam'),
    path('<int:team_id>/members/', TeamMembersView.as_view(), name='teamMembers'),
    path('<int:team_id>/role/', UserRoleView.as_view(), name='getRole'),
    path('<int:team_id>/update-role/', UpdateTeamRoleView.as_view(), name='updateTeamMemberRole'),
    path('<int:team_id>/kick/', KickMemberView.as_view(), name='kickTeamMember'),
    path('<int:team_id>/leave/', LeaveTeamView.as_view(), name='leaveTeam'),
    path('<int:team_id>/invite-permissions/', UpdateInvitePermissionsView.as_view(), name='updateInvitePermissions'),
    path('<int:team_id>/invite/', InviteMembersView.as_view(), name='inviteMembers'),
    path('<int:team_id>/email-invite/', EmailInviteView.as_view(), name='emailInvite'),
    path('accept-invitation/<str:token>/', AcceptEmailInvitationView.as_view(), name='acceptEmailInvitation'),
    path('users/', UsersView.as_view(), name='usersList'),
    path('<int:team_id>/update-max-members/', UpdateTeamMaxMembersView.as_view(), name='updateTeamMaxMembers'),
]