from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions
# from tutorial.quickstart.serializers import UserSerializer, GroupSerializer, ExperimentSerializer
from tutorial.quickstart.serializers import UserSerializer, GroupSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    # permission_classes = [permissions.IsAuthenticated]
    permission_classes = []

    # def create(self, *args, **kwargs):
    #     # async_to_sync(channel_layer.group_send)("group", {'type': 'new_message', 'message': "New Thread"})
    #     print("Teste2")
    #     print(kwargs)
    #     kwargs['is_superuser'] = False
    #     kwargs['is_staff'] = False
    #     return super().create(*args, **kwargs)

    



class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


# class ExperimentViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint that allows groups to be viewed or edited.
#     """
#     queryset = Group.objects.all()
#     serializer_class = ExperimentSerializer
#     # permission_classes = [permissions.IsAuthenticated]
#     permission_classes = []
