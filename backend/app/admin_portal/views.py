from rest_framework import status, generics, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from teams.models import Team, TeamMember
from teams.serializers import TeamMemberSerializer
from rest_framework.permissions import BasePermission
from .models import (
    EducationInteraction, ActionInteraction, UserSearchHistory, 
    UserPageActivity, SDGFormActivity, UserBrowserActivity
)
from .serializers import (
    EducationInteractionSerializer, ActionInteractionSerializer,
    UserSearchHistorySerializer, UserPageActivitySerializer,
    SDGFormActivitySerializer, UserBrowserActivitySerializer
)
from sdg_education.models import EducationDb
from sdg_actions.models import ActionDb
from sdg_action_plan.models import SDGActionPlan
from django.utils.timezone import now
from django.db.models import Sum, Max, F, Count, Q
from django.db import models
from .utils import time_range_filter
from collections import Counter
from .utils import get_sdg_name

# Helper permission class to check is_staff or is_superuser
class IsSiteAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)

### Function to show all users in the database (only admins can use)
class AdminUserListView(generics.GenericAPIView):
    permission_classes = [IsSiteAdmin]

    def get(self, request, *args, **kwargs):
        users = User.objects.values("id", "username", "email")
        return Response(list(users))

### Function to show all teams in the database (only admins can use)
class AdminTeamListView(generics.GenericAPIView):
    permission_classes = [IsSiteAdmin]

    def get(self, request, *args, **kwargs):
        teams = Team.objects.values("id", "name", "description", "created_at")
        return Response(list(teams))

### Function to show all members of any team in database (admin only)
class AdminTeamMembersView(generics.GenericAPIView):
    permission_classes = [IsSiteAdmin]
    serializer_class = TeamMemberSerializer

    def get(self, request, *args, **kwargs):
        team_id = kwargs.get("team_id")
        if not Team.objects.filter(id=team_id).exists():
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        #Gets all team member objects from a team id
        team = Team.objects.get(id=team_id)
        members = TeamMember.objects.filter(team=team)
        serializer = self.get_serializer(members, many=True)
        return Response({"members": serializer.data})

### Function to let admin kick members of a team 
class AdminKickMemberView(generics.GenericAPIView):
    permission_classes = [IsSiteAdmin]

    def post(self, request, *args, **kwargs):
        team_id = kwargs.get("team_id")
        username = request.data.get("username")

        if not Team.objects.filter(id=team_id).exists():
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        if not User.objects.filter(username=username).exists():
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        #Gets team and user from request body
        team = Team.objects.get(id=team_id)
        user = User.objects.get(username=username)

        if not TeamMember.objects.filter(team=team, user=user).exists():
            return Response({"message": "User is not a member of this team."}, status=status.HTTP_404_NOT_FOUND)

        membership = TeamMember.objects.get(team=team, user=user)

        #Can't kick team owner
        if membership.role == 'owner':
            return Response({"message": "Cannot remove the team owner."}, status=status.HTTP_403_FORBIDDEN)

        membership.delete()
        return Response({"message": f"{username} was removed from the team."}, status=status.HTTP_200_OK)

#Function to let admin update roles in a team
class AdminUpdateRoleView(generics.GenericAPIView):
    permission_classes = [IsSiteAdmin]

    def post(self, request, *args, **kwargs):
        team_id = kwargs.get("team_id")
        username = request.data.get("username")
        new_role = request.data.get("new_role")

        #Error checks
        if new_role not in ['admin', 'member']:
            return Response({"message": "Only 'admin' or 'member' roles can be assigned."}, status=status.HTTP_400_BAD_REQUEST)

        if not Team.objects.filter(id=team_id).exists():
            return Response({"message": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        if not User.objects.filter(username=username).exists():
            return Response({"message": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        team = Team.objects.get(id=team_id)
        user = User.objects.get(username=username)

        if not TeamMember.objects.filter(team=team, user=user).exists():
            return Response({"message": "User is not a member of this team."}, status=status.HTTP_404_NOT_FOUND)

        membership = TeamMember.objects.get(team=team, user=user)

        if membership.role == 'owner':
            return Response({"message": "Cannot change role of team owner."}, status=status.HTTP_403_FORBIDDEN)

        membership.role = new_role
        membership.save()

        return Response({"message": f"{username} changed to {new_role}."}, status=status.HTTP_200_OK)

###Function to log an education interaction
class LogEducationInteractionView(generics.CreateAPIView):
    serializer_class = EducationInteractionSerializer
    permission_classes = []

    def post(self, request, *args, **kwargs):
        education_id = request.data.get('educationId')
        education = EducationDb.objects.get(id=education_id)
        user = request.user if request.user.is_authenticated else None

        #Create education interaction object
        interaction = EducationInteraction.objects.create(
            userId=user,
            educationId=education,
            educationName=education.title,
            related_sdgs=education.sdgs_related,
            related_disciplines=education.related_to_which_discipline,
            related_industries=education.useful_for_which_industries
        )

        serializer = self.get_serializer(interaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

###Function to log an action interaction
class LogActionInteractionView(generics.CreateAPIView):
    serializer_class = ActionInteractionSerializer
    permission_classes = []

    def post(self, request, *args, **kwargs):
        action_id = request.data.get('actionId')
        action = ActionDb.objects.get(id=action_id)
        user = request.user if request.user.is_authenticated else None

        #Create an action interaction object
        interaction = ActionInteraction.objects.create(
            userId=user,
            actionId=action,
            actionName=action.actions,
            related_sdgs=action.sdgs,
            related_industries=action.related_industry
        )

        serializer = self.get_serializer(interaction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Function to show how many times an education page has been viewed
class EducationViewCountView(generics.GenericAPIView):
    permission_classes = [IsSiteAdmin]

    def get(self, request, *args, **kwargs):
        education_id = kwargs.get('education_id')
        total_views = EducationInteraction.objects.filter(
            educationId=education_id).aggregate(total=Count('id'))['total'] or 0
        return Response({"education_id": education_id, "total_views": total_views}, status=status.HTTP_200_OK)

### Function to show how many times an action page has been viewed
class ActionViewCountView(generics.GenericAPIView):
    permission_classes = [IsSiteAdmin]

    def get(self, request, *args, **kwargs):
        action_id = kwargs.get('action_id')
        total_views = ActionInteraction.objects.filter(
            actionId=action_id).aggregate(total=Count('id'))['total'] or 0
        return Response({"action_id": action_id, "total_views": total_views}, status=status.HTTP_200_OK)

### Function to show the education/action pages a user has viewed, sorted by their most recently viewed
class UserInteractionsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = kwargs.get("user_id")

        educations = (
            EducationInteraction.objects.filter(userId=user_id)
            .values("educationId", "educationName")
            .annotate(count=models.Count("id"), last_accessed=Max("timestamp"))
            .order_by("-last_accessed")
        )

        actions = (
            ActionInteraction.objects.filter(userId=user_id)
            .values("actionId", "actionName")
            .annotate(count=models.Count("id"), last_accessed=Max("timestamp"))
            .order_by("-last_accessed")
        )

        # Formats date-time into human readable string
        for item in educations:
            item["last_accessed"] = item["last_accessed"].strftime(
                '%d %b %Y, %I:%M:%S %p')
        for item in actions:
            item["last_accessed"] = item["last_accessed"].strftime(
                '%d %b %Y, %I:%M:%S %p')

        return Response({
            "education_pages_viewed": list(educations),
            "action_plans_viewed": list(actions)
        }, status=status.HTTP_200_OK)

### Function to return the top education pages based on view count
class TopEducationsView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        time_range = request.data.get("time_range", "all time")
        time_filter = time_range_filter(time_range)

        # Filter based on time
        queryset = EducationInteraction.objects.all()
        if time_filter:
            queryset = queryset.filter(timestamp__gte=time_filter)

        #Sort by total views, then most recently accessed to break ties
        top_educations = (
            queryset
            .values("educationId", "educationName")
            .annotate(total_views=Count("id"), last_accessed=Max("timestamp"))
            .order_by("-total_views", "-last_accessed")[:20]
        )

        #Convert to human readable string
        for item in top_educations:
            item["last_accessed"] = item["last_accessed"].strftime(
                '%d %b %Y, %I:%M:%S %p')

        return Response(list(top_educations), status=status.HTTP_200_OK)

### Function to return the top action pages based on view count
class TopActionsView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        time_range = request.data.get("time_range", "all time")
        time_filter = time_range_filter(time_range)

        #Filter based on time
        queryset = ActionInteraction.objects.all()
        if time_filter:
            queryset = queryset.filter(timestamp__gte=time_filter)

        #Sort by total views, then most recently accessed to break ties
        top_actions = (
            queryset
            .values("actionId", "actionName")
            .annotate(total_views=Count("id"), last_accessed=Max("timestamp"))
            .order_by("-total_views", "-last_accessed")[:20]
        )

        #Convert to human readable string
        for item in top_actions:
            item["last_accessed"] = item["last_accessed"].strftime(
                '%d %b %Y, %I:%M:%S %p')

        return Response(list(top_actions), status=status.HTTP_200_OK)

### Function to return the top sdgs related to education pages based on view count
class TopEducationSDGsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        time_range = request.data.get("time_range", "all time")
        time_filter = time_range_filter(time_range)

        #Filter based on time
        queryset = EducationInteraction.objects.all()
        if time_filter:
            queryset = queryset.filter(timestamp__gte=time_filter)

        # Extracts and counts all SDG appearances from the queryset
        all_sdgs = []
        for entry in queryset:
            if entry.related_sdgs:
                all_sdgs.extend([sdg.strip()
                                for sdg in entry.related_sdgs.split(',')])

        counter = Counter(all_sdgs)
        top_sdgs = counter.most_common(5)
        return Response([{"sdg": sdg, "sdg_name": get_sdg_name(sdg), "total_views": count} for sdg, count in top_sdgs], status=status.HTTP_200_OK)


### Function to return the top sdgs related to action pages based on view count
class TopActionSDGsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        time_range = request.data.get("time_range", "all time")
        time_filter = time_range_filter(time_range)

        #Filter based on time
        queryset = ActionInteraction.objects.all()
        if time_filter:
            queryset = queryset.filter(timestamp__gte=time_filter)

        # Extracts and counts all SDG appearances from the queryset
        all_sdgs = []
        for entry in queryset:
            if entry.related_sdgs:
                all_sdgs.extend([sdg.strip()
                                for sdg in entry.related_sdgs.split(',')])

        counter = Counter(all_sdgs)
        top_sdgs = counter.most_common(5)
        return Response([{"sdg": sdg, "sdg_name": get_sdg_name(sdg), "total_views": count} for sdg, count in top_sdgs], status=status.HTTP_200_OK)


### Function to get all sdg plans as an admin
class AdminGetSDGPlansView(generics.GenericAPIView):
    permission_classes = [IsSiteAdmin]

    def get(self, request, *args, **kwargs):
        plans_qs = SDGActionPlan.objects.all().values()
        plans_list = list(plans_qs)
        return Response(plans_list)


class AdminGetSDGPlansCountView(generics.GenericAPIView):
    """
    GET /admin/sdg-plans/count/

    Returns:
      - all SDGActionPlan records (as list of dicts) and count of plans created since the given time range
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        time_range = request.data.get("time_range")
        cutoff = time_range_filter(time_range)

        qs = SDGActionPlan.objects.all()

        if cutoff is not None:
            recent_qs = qs.filter(created_at__gte=cutoff)
            recent_count = recent_qs.count()
        else:
            recent_count = qs.count()

        plans_list = list(qs.values())

        return Response({
            "time_range": time_range or "all time",
            "recent_count": recent_count,
            "total_count": qs.count(),
            "plans": plans_list,
        })

### User Activity Tracking Views

class LogSearchHistoryView(generics.CreateAPIView):
    """Log user search history"""
    serializer_class = UserSearchHistorySerializer
    permission_classes = []

    def post(self, request, *args, **kwargs):
        user = request.user if request.user.is_authenticated else None
        search_query = request.data.get('search_query')
        search_type = request.data.get('search_type', 'general')
        session_id = request.data.get('session_id')

        if not search_query:
            return Response({"error": "Search query is required"}, status=status.HTTP_400_BAD_REQUEST)

        search_history = UserSearchHistory.objects.create(
            user=user,
            search_query=search_query,
            search_type=search_type,
            session_id=session_id
        )

        serializer = self.get_serializer(search_history)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LogPageActivityView(generics.CreateAPIView):
    """Log user page activity"""
    serializer_class = UserPageActivitySerializer
    permission_classes = []

    def post(self, request, *args, **kwargs):
        user = request.user if request.user.is_authenticated else None
        page_url = request.data.get('page_url')
        page_title = request.data.get('page_title')
        time_spent = request.data.get('time_spent', 0)
        session_id = request.data.get('session_id')

        if not page_url:
            return Response({"error": "Page URL is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Update existing activity or create new one
        activity, created = UserPageActivity.objects.get_or_create(
            user=user,
            page_url=page_url,
            defaults={
                'page_title': page_title,
                'time_spent': time_spent,
                'session_id': session_id
            }
        )

        if not created:
            activity.time_spent += time_spent
            activity.visit_count += 1
            activity.page_title = page_title
            activity.save()

        serializer = self.get_serializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LogSDGFormActivityView(generics.CreateAPIView):
    """Log SDG form activity"""
    serializer_class = SDGFormActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        form_id = request.data.get('form_id')
        activity_type = request.data.get('activity_type')
        field_name = request.data.get('field_name')
        content_length = request.data.get('content_length', 0)
        session_id = request.data.get('session_id')

        if not form_id or not activity_type:
            return Response({"error": "Form ID and activity type are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from sdg_action_plan.models import SDGActionPlan
            form = SDGActionPlan.objects.get(id=form_id)
        except SDGActionPlan.DoesNotExist:
            return Response({"error": "Form not found"}, status=status.HTTP_404_NOT_FOUND)

        form_activity = SDGFormActivity.objects.create(
            user=request.user,
            form=form,
            activity_type=activity_type,
            field_name=field_name,
            content_length=content_length,
            session_id=session_id
        )

        serializer = self.get_serializer(form_activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LogBrowserActivityView(generics.CreateAPIView):
    """Log browser activity"""
    serializer_class = UserBrowserActivitySerializer
    permission_classes = []

    def post(self, request, *args, **kwargs):
        user = request.user if request.user.is_authenticated else None
        activity_type = request.data.get('activity_type')
        element_id = request.data.get('element_id')
        element_type = request.data.get('element_type')
        page_url = request.data.get('page_url')
        metadata = request.data.get('metadata', {})
        session_id = request.data.get('session_id')

        if not activity_type or not page_url:
            return Response({"error": "Activity type and page URL are required"}, status=status.HTTP_400_BAD_REQUEST)

        browser_activity = UserBrowserActivity.objects.create(
            user=user,
            activity_type=activity_type,
            element_id=element_id,
            element_type=element_type,
            page_url=page_url,
            metadata=metadata,
            session_id=session_id
        )

        serializer = self.get_serializer(browser_activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserActivityAnalyticsView(generics.GenericAPIView):
    """Get user activity analytics"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.user.id
        time_range = request.query_params.get('time_range', 'all')
        
        # Get time filter
        time_filter = time_range_filter(time_range) if time_range != 'all' else None
        
        # Base querysets
        search_queryset = UserSearchHistory.objects.filter(user_id=user_id)
        page_queryset = UserPageActivity.objects.filter(user_id=user_id)
        form_queryset = SDGFormActivity.objects.filter(user_id=user_id)
        browser_queryset = UserBrowserActivity.objects.filter(user_id=user_id)
        
        if time_filter:
            search_queryset = search_queryset.filter(timestamp__gte=time_filter)
            page_queryset = page_queryset.filter(last_visit__gte=time_filter)
            form_queryset = form_queryset.filter(timestamp__gte=time_filter)
            browser_queryset = browser_queryset.filter(timestamp__gte=time_filter)

        # Search analytics
        search_stats = {
            'total_searches': search_queryset.count(),
            'search_types': list(search_queryset.values('search_type').annotate(
                count=Count('id')
            ).order_by('-count')),
            'recent_searches': list(search_queryset.values('search_query', 'search_type', 'timestamp')[:10])
        }

        # Page activity analytics
        page_stats = {
            'total_pages_visited': page_queryset.count(),
            'total_time_spent': page_queryset.aggregate(total=Sum('time_spent'))['total'] or 0,
            'most_visited_pages': list(page_queryset.values('page_title', 'page_url', 'visit_count', 'time_spent')
                                     .order_by('-visit_count')[:10])
        }

        # Form activity analytics
        form_stats = {
            'total_form_activities': form_queryset.count(),
            'activity_types': list(form_queryset.values('activity_type').annotate(
                count=Count('id')
            ).order_by('-count')),
            'total_content_length': form_queryset.aggregate(total=Sum('content_length'))['total'] or 0,
            'recent_form_activities': list(form_queryset.values('activity_type', 'field_name', 'timestamp')[:10])
        }

        # Browser activity analytics
        browser_stats = {
            'total_activities': browser_queryset.count(),
            'activity_types': list(browser_queryset.values('activity_type').annotate(
                count=Count('id')
            ).order_by('-count')),
            'recent_activities': list(browser_queryset.values('activity_type', 'page_url', 'timestamp')[:10])
        }

        # Daily activity summary
        from django.db.models import DateField
        from django.db.models.functions import TruncDate
        
        daily_activity = list(search_queryset.annotate(
            date=TruncDate('timestamp', output_field=DateField())
        ).values('date').annotate(
            searches=Count('id'),
            pages=Count('id', filter=Q(search_type='page')),
            forms=Count('id', filter=Q(search_type='form'))
        ).order_by('-date')[:30])

        return Response({
            'search_analytics': search_stats,
            'page_analytics': page_stats,
            'form_analytics': form_stats,
            'browser_analytics': browser_stats,
            'daily_activity': daily_activity
        }, status=status.HTTP_200_OK)


class UserSearchHistoryView(generics.GenericAPIView):
    """Get user search history"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.user.id
        search_type = request.query_params.get('search_type')
        limit = int(request.query_params.get('limit', 50))
        
        queryset = UserSearchHistory.objects.filter(user_id=user_id)
        if search_type:
            queryset = queryset.filter(search_type=search_type)
        
        searches = list(queryset.values('search_query', 'search_type', 'timestamp')
                       .order_by('-timestamp')[:limit])
        
        return Response(searches, status=status.HTTP_200_OK)
