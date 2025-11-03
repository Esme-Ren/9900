from django.urls import path
from .views import (
    SDGActionPlanListView,
    SDGActionPlanCreateView,
    SDGActionPlanRetrieveView,
    SDGActionPlanUpdateView,
    SDGActionPlanDeleteView,
    ActionPlanPermissionsView,
    ActionPlanEditorsView,
    ActionPlanViewersView,    ActionPlanTeamMembersView,
    SDGActionPlanGoogleDocsView,
    GoogleOAuthInitView,
    GoogleOAuthCallbackView,
)

urlpatterns = [
    # GET /api/sdg-action-plan/ returns the list of actions plans of teams user is in
    path('', SDGActionPlanListView.as_view(), name='action-plan-list'),
    # POST /api/sdg-action-plan/create/ creates a new action plan for a certain team
    path('create/', SDGActionPlanCreateView.as_view(), name='action-plan-create'),
    # GET /api/sdg-action-plan/<int:id>/ retrieves a specific action plan
    path('<int:id>/', SDGActionPlanRetrieveView.as_view(),
         name='action-plan-retrieve'),
    # PUT/PATCH /api/sdg-action-plan/<int:id>/update/ updates a specific action plan
    # anyone can update the plan on the team
    path('<int:id>/update/', SDGActionPlanUpdateView.as_view(),
         name='action-plan-update'),
    # DELETE /api/sdg-action-plan/<int:id>/delete/ deletes a specific action plan
    # anyone can delete the plan on the team
    path('<int:id>/delete/', SDGActionPlanDeleteView.as_view(),
         name='action-plan-delete'),
    
    # 新增权限管理路由
    # POST /api/sdg-action-plan/<int:id>/permissions/ 更新表单权限设置
    path('<int:id>/permissions/', ActionPlanPermissionsView.as_view(),
         name='action-plan-permissions'),
    # GET/POST /api/sdg-action-plan/<int:id>/editors/ 管理编辑者列表
    path('<int:id>/editors/', ActionPlanEditorsView.as_view(),
         name='action-plan-editors'),
    # GET/POST /api/sdg-action-plan/<int:id>/viewers/ 管理查看者列表
    path('<int:id>/viewers/', ActionPlanViewersView.as_view(),
         name='action-plan-viewers'),
    # GET /api/sdg-action-plan/<int:id>/team-members/ 获取团队成员列表
    path('<int:id>/team-members/', ActionPlanTeamMembersView.as_view(),
         name='action-plan-team-members'),
    path('<int:id>/google-docs/', SDGActionPlanGoogleDocsView.as_view(), name='action-plan-google-docs'),
    
    # OAuth endpoints
    path('auth/google/init/', GoogleOAuthInitView.as_view(), name='google-oauth-init'),
    path('auth/google/callback/', GoogleOAuthCallbackView.as_view(), name='google-oauth-callback'),
]

