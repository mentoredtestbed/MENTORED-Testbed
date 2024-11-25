# from django.urls import path
from django.urls import include, path
from experiments import views
from rest_framework import routers

from api import views as ApiViews


from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = routers.DefaultRouter()

# router.register(r'experiments', views.ExperimentViewSet)

urlpatterns = [
    # path('', include('experiments.urls')),
    # path('experiments/<int:pk>/', views.experiment_detail),
    path('api/token/', ApiViews.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', ApiViews.RegisterView.as_view(), name='auth_register'),
    path('api/api/', ApiViews.getRoutes),
    path('get_webkubectl_token/', views.get_webkubectl_token),
    path('get_running_pods/<int:pk>/', views.get_running_pods),
    path('api/projects/get_project_kubeconfig/<int:pk>/', views.project_request_get_kube_config),
    path('experimentexecutions/experiment_execution_stop/<int:pk>/', views.experiment_execution_stop),
    path('get_login_data/', views.get_login_data),

    path('logout/', views.logout_view),
    path('get_user_status/', views.get_user_status_view),
    path('get_user_role/', views.get_user_role_view),
    path('projectmembers/<int:project_id>/', views.ProjectMemberViewSet.as_view({'get': 'list', 'post': 'add_member', 'delete': 'remove_member'})),
    path('projectmembers/<int:project_id>/<int:user_id>/', views.ProjectMemberViewSet.as_view({'delete': 'remove_member'})),
    path('experiments_list/<int:project_id>/', views.ExperimentListViewSet.as_view({'get': 'list'})),
    path('experiment_executions_list/<int:experiment_id>/', views.ExperimentExecutionListViewSet.as_view({'get': 'list'})),
    path('get_project_user_role/<int:project_id>/', views.get_project_user_role_view),
    path('get_all_projects_user_role/',views.get_all_project_user_role_view),
    path('edit_project_user_role/<int:project_id>/', views.edit_project_user_role_view),
    path('publicprojects/', views.PublicProjectViewSet.as_view({'get': 'list'})),
    path('get_project_with_name/<str:project_name>/', views.get_project_with_name),
    path('get_cluster_info/', views.get_cluster_info),
]
