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

    path('api/experimentexecutions/experiment_download_data/<int:pk>/', views.experiment_download_data),
    path('api/projects/get_project_kubeconfig/<int:pk>/', views.project_request_get_kube_config),
    path('api/experimentexecutions/experiment_execution_stop/<int:pk>/', views.experiment_execution_stop),
    path('get_login_data/', views.get_login_data),
]
