from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Team, TeamMember, EmailInvitation
from users.models import User
from .serializers import TeamCreateSerializer, TeamMemberSerializer
from django.contrib.auth.models import User
import uuid
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

### Function for a user to create a team
class CreateTeamView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeamCreateSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            team = serializer.save()
            TeamMember.objects.create(
                team=team,
                user=request.user,
                role='owner',
                is_pending=False,
                can_invite=True
            )
            
            #Can invite users when initially creating team too
            invited_usernames = request.data.get("invite_usernames", [])
            invitation_results = []

            #Find users with the given usernames and append them to a list of people to invite
            for username in invited_usernames:
                result = invite_user_to_team(team, request.user, username)
                invitation_results.append(result)

            return Response({
                "team": TeamCreateSerializer(team).data,
                "message": "Team created successfully.",
                "invitations": invitation_results
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "message": "Team creation failed."
            }, status=status.HTTP_400_BAD_REQUEST)

### Function to view team        
class TeamView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        team_id = kwargs.get('team_id')
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        #Returns team serializer data (id, name, description)
        serializer = TeamCreateSerializer(team)
        return Response(serializer.data, status=status.HTTP_200_OK)

### Function to delete team
class DeleteTeamView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        team_id = kwargs.get('team_id')
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        #Check to see if person deleting is a member of the team and is also the owner of the team
        membership = TeamMember.objects.filter(team=team, user=request.user).first()
        if not membership or membership.role != 'owner':
            return Response({"message": "Only the team owner can delete this team."}, status=status.HTTP_403_FORBIDDEN)

        #Delete team
        team.delete()
        return Response({"message": "Team deleted successfully."}, status=status.HTTP_200_OK)
    
### View team member data of a team
class TeamMembersView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeamMemberSerializer

    def get(self, request, *args, **kwargs):
        team_id = kwargs.get('team_id')
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        if not TeamMember.objects.filter(team=team, user=request.user).exists():
            return Response({"message": "You must be a team member to view this."}, status=status.HTTP_403_FORBIDDEN)

        #Return team member serializer data of all team members in the team
        members = TeamMember.objects.filter(team=team)
        serializer = self.get_serializer(members, many=True)
        return Response({"members": serializer.data}, status=status.HTTP_200_OK)

### Function which returns the user's role in a team
class UserRoleView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        team_id = kwargs.get('team_id')
        user = request.user.username
        if "username" in request.data:
            user = request.data["username"]

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        if not TeamMember.objects.filter(team=team, user__username=user, is_pending=False).exists():
            return Response({"message": "You must be a team member to view this."}, status=status.HTTP_403_FORBIDDEN)
        
        #Returns the user's membership and invite permissions if they are part of the team
        member = TeamMember.objects.filter(team=team, user__username=user).first()
        return Response({"role": member.role, "can_invite": member.can_invite})
    

#Helper function to do checks on requesting and target users (for the two functions below)
def get_team_and_memberships(team_id, requester, target_username):
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return None, None, Response({"message": "Team could not be found."}, status=status.HTTP_404_NOT_FOUND)

    requester_membership = TeamMember.objects.filter(team=team, user=requester).first()
    if not requester_membership or requester_membership.is_pending:
        return None, None, Response({"message": "User is not a member of this team."}, status=status.HTTP_403_FORBIDDEN)

    try:
        target_user = User.objects.get(username=target_username)
        target_membership = TeamMember.objects.get(team=team, user=target_user)
    except (User.DoesNotExist, TeamMember.DoesNotExist):
        return None, None, Response({"message": "User is not a member of this team."}, status=status.HTTP_404_NOT_FOUND)

    return requester_membership, target_membership, None

### Function to update a member's role in a team 
class UpdateTeamRoleView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        new_role = request.data.get("new_role")
        team_id = kwargs.get('team_id')

        if new_role not in ['owner', 'admin', 'member']:
            return Response({"message": "The only valid roles are owner, admin and member."}, status=status.HTTP_400_BAD_REQUEST)

        requester_membership, target_membership, error_response = get_team_and_memberships(team_id, request.user, username)
        if error_response:
            return error_response

        requester_role = requester_membership.role
        target_role = target_membership.role

        if new_role == target_role:
            return Response({"message": f"{username} already has the role of {new_role}."}, status=status.HTTP_400_BAD_REQUEST)

        #Conditions for promoting/demoting
        if requester_role == 'owner':
            if new_role == 'owner':
                if target_role == 'admin':
                    # Transfer ownership to a team admin
                    requester_membership.role = 'admin'
                    requester_membership.save()
                    target_membership.role = 'owner'
                    target_membership.save()
                    return Response({"message": f"Ownership transferred to {username}."}, status=status.HTTP_200_OK)
                else: 
                    return Response({"message": "Owner can only transfer ownership to an admin"}, status=status.HTTP_403_FORBIDDEN)
                
            else:
                target_membership.role = new_role
                target_membership.save()
                return Response({"message": f"{username} is now a team {new_role}."}, status=status.HTTP_200_OK)

        elif requester_role == 'admin':
            if target_role != 'member':
                return Response({"message": "Admins cannot modify other admins or the team owner."}, status=status.HTTP_403_FORBIDDEN)

            if new_role != 'admin':
                return Response({"message": "Admins can only promote members to team admin."}, status=status.HTTP_403_FORBIDDEN)

            target_membership.role = 'admin'
            target_membership.save()
            return Response({"message": f"{username} was promoted to team admin."}, status=status.HTTP_200_OK)
        
        else: 
            return Response({"message": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)
        
###Function to kick a member out of a team
class KickMemberView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        team_id = kwargs.get("team_id")
        username = request.data.get("username")  

        requester_membership, target_membership, error_response = get_team_and_memberships(team_id, request.user, username)
        if error_response:
            return error_response

        #User should leave a team instead of kicking themselves out
        if request.user.username == username:
            return Response({"message": "User should leave the team by using the leave button"}, status=status.HTTP_400_BAD_REQUEST)

        requester_role = requester_membership.role
        target_role = target_membership.role

        #Conditions for whether the requester can kick the other user out of the team
        if requester_role == 'owner':
            target_membership.delete()
            return Response({"message": f"{username} was removed from the team."}, status=status.HTTP_200_OK)

        elif requester_role == 'admin':
            if target_role == 'member':
                target_membership.delete()
                return Response({"message": f"{username} was removed from the team."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Admins cannot remove other admins or the team owner from the team."}, status=status.HTTP_403_FORBIDDEN)

        else:
            return Response({"message": "User does not have permission to remove members from the team."}, status=status.HTTP_403_FORBIDDEN)
        

### Function for a user to leave a team
class LeaveTeamView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        team_id = kwargs.get("team_id")

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"message": "Team could not be found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        membership = TeamMember.objects.filter(team=team, user=user).first()

        if not membership or membership.is_pending:
            return Response({"message": "User is not an active member of this team."}, status=status.HTTP_403_FORBIDDEN)

        #Owners of teams cannot leave until they transfer ownership
        if membership.role == 'owner':
            return Response({"message": "Team owners must transfer ownership before leaving."}, status=status.HTTP_403_FORBIDDEN)

        membership.delete()

        return Response({"message": "You have left the team successfully."}, status=status.HTTP_200_OK)
    
### Function to update a user's invite permissions in a team
class UpdateInvitePermissionsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        team_id = kwargs.get("team_id")
        username = request.data.get("username")

        #Error checks
        if "can_invite" not in request.data:
            return Response({"message": "'can_invite' must be provided."}, status=status.HTTP_400_BAD_REQUEST)

        can_invite = request.data["can_invite"]

        if not isinstance(can_invite, bool):
            return Response({"message": "'can_invite' must either be 'True' or 'False'."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            team = Team.objects.get(id=team_id)
            target_user = User.objects.get(username=username)
        except (Team.DoesNotExist, User.DoesNotExist):
            return Response({"message": "Team or user not found."}, status=status.HTTP_404_NOT_FOUND)

        requester_membership = TeamMember.objects.filter(team=team, user=request.user).first()
        target_membership = TeamMember.objects.filter(team=team, user=target_user).first()

        #Conditions for being able to update invite permissions
        if not requester_membership or requester_membership.is_pending:
            return Response({"message": "User is not a member of this team."}, status=status.HTTP_403_FORBIDDEN)

        if requester_membership.role not in ['owner', 'admin']:
            return Response({"message": "Only team owner or admins can update invite permissions."}, status=status.HTTP_403_FORBIDDEN)

        if not target_membership or target_membership.role != 'member':
            return Response({"message": "Only regular members need to have invite permissions changed."}, status=status.HTTP_400_BAD_REQUEST)

        if target_membership.can_invite == can_invite:
            status_text = "already has" if can_invite else "already does not have"
            return Response({"message": f"{username} {status_text} invite permissions."}, status=status.HTTP_400_BAD_REQUEST)

        #Update target user's invite permissions
        target_membership.can_invite = can_invite
        target_membership.save()

        action = "granted" if can_invite else "revoked"
        return Response({"message": f"Invite permission {action} for {username}."}, status=status.HTTP_200_OK)
    

#Helper function for inviting team members
def invite_user_to_team(team, inviter, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return {"username": username, "status": "User not found."}

    # 检查团队是否已达到最大成员数
    if not team.can_add_member():
        return {"username": username, "status": f"Team has reached maximum member limit ({team.max_members})."}

    # 检查用户是否已经是团队成员
    if TeamMember.objects.filter(team=team, user=user).exists():
        return {"username": username, "status": "User is already a member of this team."}

    # 创建团队成员记录
    TeamMember.objects.create(
        team=team,
        user=user,
        role='member',
        is_pending=True,
        invited_by=inviter
    )

    return {"username": username, "status": "Invitation sent successfully."}

###Function to invite members to a team
class InviteMembersView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        team_id = kwargs.get("team_id")
        usernames = request.data.get("usernames", [])

        #Need to invite at least one person when calling the function
        if not isinstance(usernames, list) or not usernames:
            return Response({"message": "At least one username must be provided in list format."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        #Append invitees to a list and return it in response
        invite_results = []
        for username in usernames:
            result = invite_user_to_team(team, request.user, username)
            invite_results.append(result)

        return Response({
            "message": "Invite process completed.",
            "invitations": invite_results
        }, status=status.HTTP_200_OK)
    
### Function which returns list of users which can be invited to the team
class UsersView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        team_id = request.headers.get('Team-Id', None)
        usernames = User.objects.filter(is_staff=False, is_superuser=False).exclude(username=request.user).values_list('username', flat=True)
        if team_id is None:
            return Response({
                'all_headers': team_id,
                "usernames": usernames
            }, status=status.HTTP_200_OK)
        filteredUsernames = []
        for username in usernames:
            already_invited = TeamMember.objects.filter(team=team_id, user__username=username).first()
            if already_invited is None:
                filteredUsernames.append(username)
        
        return Response({
            'all_headers': team_id,
            "usernames": filteredUsernames
        }, status=status.HTTP_200_OK)

### Function to invite users via email
class EmailInviteView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        team_id = kwargs.get("team_id")
        emails = request.data.get("emails", [])

        if not isinstance(emails, list) or not emails:
            return Response({"message": "At least one email must be provided in list format."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        # 检查邀请者权限
        requester_membership = TeamMember.objects.filter(team=team, user=request.user).first()
        if not requester_membership or requester_membership.is_pending:
            return Response({"message": "You must be a team member to invite others."}, status=status.HTTP_403_FORBIDDEN)

        if requester_membership.role not in ['owner', 'admin'] and not requester_membership.can_invite:
            return Response({"message": "You don't have permission to invite users."}, status=status.HTTP_403_FORBIDDEN)

        # 检查团队是否已达到最大成员数
        if not team.can_add_member():
            return Response({"message": f"Team has reached maximum member limit ({team.max_members})."}, status=status.HTTP_400_BAD_REQUEST)

        invitation_results = []
        for email in emails:
            result = self.send_email_invitation(team, request.user, email)
            invitation_results.append(result)

        return Response({
            "message": "Email invitations sent.",
            "invitations": invitation_results
        }, status=status.HTTP_200_OK)

    def send_email_invitation(self, team, inviter, email):
        try:
            # 检查是否已经邀请过这个邮箱
            existing_invitation = EmailInvitation.objects.filter(
                team=team, 
                email=email, 
                is_accepted=False
            ).first()
            
            if existing_invitation:
                if not existing_invitation.is_expired():
                    return {"email": email, "status": "Invitation already sent and not expired."}
                else:
                    # 如果邀请已过期，删除它
                    existing_invitation.delete()

            # 创建邀请token
            token = str(uuid.uuid4())
            expires_at = timezone.now() + timedelta(days=7)  # 7天有效期

            # 创建邀请记录
            invitation = EmailInvitation.objects.create(
                email=email,
                team=team,
                invited_by=inviter,
                token=token,
                expires_at=expires_at
            )

            # 发送邮件
            try:
                subject = f"{settings.EMAIL_SUBJECT_PREFIX}邀请加入团队: {team.name}"
                message = f"""
                您被邀请加入团队 "{team.name}"。
                
                请点击以下链接接受邀请：
                {settings.SITE_URL}/teams/accept-invitation/{token}/
                
                此邀请将在7天后过期。
                
                如果您没有请求此邀请，请忽略此邮件。
                """
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                logger.info(f"Successfully sent invitation email to {email} for team {team.name}")
                return {"email": email, "status": "Invitation sent successfully."}
            except Exception as e:
                logger.error(f"Failed to send invitation email to {email}: {str(e)}")
                invitation.delete()
                return {"email": email, "status": f"Failed to send invitation: {str(e)}"}
        except Exception as e:
            logger.error(f"Error in send_email_invitation: {str(e)}")
            return {"email": email, "status": f"Internal server error: {str(e)}"}

### Function to accept email invitation
class AcceptEmailInvitationView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        token = kwargs.get("token")
        
        try:
            invitation = EmailInvitation.objects.get(token=token, is_accepted=False)
        except EmailInvitation.DoesNotExist:
            return Response({"message": "Invalid or expired invitation."}, status=status.HTTP_404_NOT_FOUND)

        if invitation.is_expired():
            return Response({"message": "Invitation has expired."}, status=status.HTTP_400_BAD_REQUEST)

        # 检查用户邮箱是否匹配
        if request.user.email != invitation.email:
            return Response({"message": "This invitation was sent to a different email address."}, status=status.HTTP_403_FORBIDDEN)

        # 检查团队是否已达到最大成员数
        if not invitation.team.can_add_member():
            return Response({"message": f"Team has reached maximum member limit ({invitation.team.max_members})."}, status=status.HTTP_400_BAD_REQUEST)

        # 检查用户是否已经是团队成员
        if TeamMember.objects.filter(team=invitation.team, user=request.user).exists():
            invitation.is_accepted = True
            invitation.save()
            return Response({"message": "You are already a member of this team."}, status=status.HTTP_400_BAD_REQUEST)

        # 创建团队成员记录
        TeamMember.objects.create(
            team=invitation.team,
            user=request.user,
            role='member',
            is_pending=False,
            invited_by=invitation.invited_by
        )

        # 标记邀请为已接受
        invitation.is_accepted = True
        invitation.save()

        return Response({
            "message": f"Successfully joined team '{invitation.team.name}'.",
            "team_id": invitation.team.id
        }, status=status.HTTP_200_OK)

### Function for team owner to update max members
class UpdateTeamMaxMembersView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        team_id = kwargs.get("team_id")
        max_members = request.data.get("max_members")

        # 验证输入
        if not isinstance(max_members, int) or max_members < 1:
            return Response({"message": "max_members must be a positive integer."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        # 检查用户是否是团队所有者
        try:
            member = TeamMember.objects.get(team=team, user=request.user)
            if member.role != 'owner':
                return Response({"message": "Only team owner can update max members."}, status=status.HTTP_403_FORBIDDEN)
        except TeamMember.DoesNotExist:
            return Response({"message": "You are not a member of this team."}, status=status.HTTP_403_FORBIDDEN)

        # 检查新的最大成员数是否小于当前成员数
        current_members = team.get_current_member_count()
        if max_members < current_members:
            return Response({
                "message": f"Cannot set max_members to {max_members} as team currently has {current_members} members."
            }, status=status.HTTP_400_BAD_REQUEST)

        # 获取全局设置的最大值
        from admin_portal.models import GlobalSettings
        global_max = int(GlobalSettings.get_setting("default_team_max_members", "6"))
        
        # 检查是否超过全局设置的最大值
        if max_members > global_max:
            return Response({
                "message": f"Cannot set max_members higher than the global maximum ({global_max})."
            }, status=status.HTTP_400_BAD_REQUEST)

        team.max_members = max_members
        team.save()

        return Response({
            "message": f"Team max members updated to {max_members}.",
            "max_members": max_members
        }, status=status.HTTP_200_OK)