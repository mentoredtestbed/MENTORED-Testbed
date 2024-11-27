from django.contrib import admin

from django.urls import include, path
from rest_framework import routers
from tutorial.quickstart import views

from experiments.views import ExperimentViewSet, ProjectRequestViewSet, ProjectViewSet, ExperimentExecutionViewSet, ComanageUserViewSet, NotificationViewSet, ClusterInfoViewSet

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'comanage_users', ComanageUserViewSet)
router.register(r'notifications', NotificationViewSet)

router.register(r'experiments', ExperimentViewSet)
router.register(r'projectrequests', ProjectRequestViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'experimentexecutions', ExperimentExecutionViewSet)
router.register(r'clusterinfo', ClusterInfoViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('api/', include('experiments.urls')),
    path('api/', include(router.urls)),
    path('api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/api/', include("api.urls")),
   path('api/admin/', admin.site.urls),
#   path('', include('base.urls', namespace='base')),
   path(r'api/saml2/', include('djangosaml2.urls'))
]
