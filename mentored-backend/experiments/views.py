from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from experiments.models import Experiment, ProjectRequest, Project, ExperimentExecution
from experiments.serializers import ExperimentSerializer, ProjectRequestSerializer, ProjectSerializer, ExperimentExecutionSerializer

from rest_framework import viewsets
from django.contrib.auth.models import User, Group

from rest_framework.permissions import IsAdminUser

from rest_framework import permissions



from django.shortcuts import redirect

import json

class IsSuperUser(IsAdminUser):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


# @csrf_exempt
# def experiment_list(request):
#     """
#     List all code experiments, or create a new experiment.
#     """
#     if request.method == 'GET':
#         experiments = Experiment.objects.all()
#         serializer = ExperimentSerializer(experiments, many=True)
#         return JsonResponse(serializer.data, safe=False)

#     elif request.method == 'POST':
#         data = JSONParser().parse(request)
#         serializer = ExperimentSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return JsonResponse(serializer.data, status=201)
#         return JsonResponse(serializer.errors, status=400)

# @csrf_exempt
# def experiment_detail(request, pk):
#     """
#     Retrieve, update or delete a code experiment.
#     """
#     try:
#         experiment = Experiment.objects.get(pk=pk)
#     except Experiment.DoesNotExist:
#         return HttpResponse(status=404)

#     if request.method == 'GET':
#         serializer = ExperimentSerializer(experiment)
#         return JsonResponse(serializer.data)

#     elif request.method == 'PUT':
#         data = JSONParser().parse(request)
#         serializer = ExperimentSerializer(experiment, data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return JsonResponse(serializer.data)
#         return JsonResponse(serializer.errors, status=400)

#     elif request.method == 'DELETE':
#         experiment.delete()
#         return HttpResponse(status=204)


# class ExperimentViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint that allows groups to be viewed or edited.
#     """
#     queryset = Experiment.objects.all()
#     serializer_class = ExperimentSerializer
#     # permission_classes = [permissions.IsAuthenticated]
#     permission_classes = []


    

# class ExperimentViewSet(viewsets.ViewSet):
#     def list(self, request):
#         queryset = Experiment.objects.all()
#         serializer = ExperimentSerializer(queryset, many=True)
#         return Response(serializer.data)

#     def create(self, request):
#         # print("Teste")
#         # print(request)
#         pass

#     def retrieve(self, request, pk=None):
#         pass

#     def update(self, request, pk=None):
#         pass

#     def partial_update(self, request, pk=None):
#         pass

#     def destroy(self, request, pk=None):
#         pass

class ExperimentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Experiment.objects.all().order_by('-created')
    serializer_class = ExperimentSerializer
    # permission_classes = [permissions.IsAuthenticated]
    permission_classes = []

    def pre_save(self, obj):
        obj.experiment_yaml_file = self.request.FILES.get('file')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


    def create(self, *args, **kwargs):
        # async_to_sync(channel_layer.group_send)("group", {'type': 'new_message', 'message': "New Thread"})
        print("Teste")
        print(args)
        return super().create(*args, **kwargs)


class ProjectRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    # queryset = ProjectRequest.objects.all()
    queryset = ProjectRequest.objects.all().order_by('-created')
    serializer_class = ProjectRequestSerializer
    # permission_classes = [permissions.IsAuthenticated]
    permission_classes = []

    def create(self, *args, **kwargs):
        # async_to_sync(channel_layer.group_send)("group", {'type': 'new_message', 'message': "New Thread"})
        print("Teste2")
        print(args)
        return super().create(*args, **kwargs)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    # queryset = Project.objects.all()
    queryset = Project.objects.all().order_by('-created')
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    # permission_classes = [IsSuperUser]

    def create(self, *args, **kwargs):
        # async_to_sync(channel_layer.group_send)("group", {'type': 'new_message', 'message': "New Thread"})
        print("Teste")
        print(args)
        return super().create(*args, **kwargs)



#     def create(self, request):
#         print("Teste")
#         print(request)
#         pass


class ExperimentExecutionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = ExperimentExecution.objects.all().order_by('-created')
    serializer_class = ExperimentExecutionSerializer
    permission_classes = [permissions.IsAuthenticated]
    # permission_classes = [IsSuperUser]
    # permission_classes = []

    def create(self, *args, **kwargs):
        # async_to_sync(channel_layer.group_send)("group", {'type': 'new_message', 'message': "New Thread"})
        print("Teste")
        print(args)
        return super().create(*args, **kwargs)



#     def create(self, request):
#         print("Teste")
#         print(request)
#         pass


def project_request_get_kube_config(request, pk):
    # response = HttpResponse(content_type='text/yaml')
    # response['Content-Disposition'] = 'attachment; filename="config.yaml"'

    p = Project.objects.get(id=pk)
    content = p.kube_config
    response = HttpResponse(content, content_type='text/yaml')
    response['Content-Disposition'] = 'attachment; filename="config.yaml"'

    return response

def experiment_execution_stop(request, pk):
    # response = HttpResponse(content_type='text/yaml')
    # response['Content-Disposition'] = 'attachment; filename="config.yaml"'

    # ee = ExperimentExecution.objects.get(id=pk)
    # ee.stop()

    print(request.META)
    print(request.META.keys())
    print(request.user.pk)
    # for field in request.user._Meta.fields:
    #     print(field.name, field.value_to_string(user))


    return redirect('/experimentexecutions/{}'.format(pk))
    # return redirect('/experimentexecutions/1/')
    # return "A"


def get_login_data(request):
    # response = HttpResponse(content_type='text/yaml')
    # response['Content-Disposition'] = 'attachment; filename="config.yaml"'

    # ee = ExperimentExecution.objects.get(id=pk)
    # ee.stop()

    # print(request.META)
    # print(request.META.keys())
    # print(request.user.pk)
    # for field in request.user._Meta.fields:
    #     print(field.name, field.value_to_string(user))
    

    # print(request.META)
    # print(dir(request.user))

    response_data = {
        'user': {
            'username': request.user.username,
            'pk': request.user.pk,
            'email': request.user.email,
            # 'email_user': request.user.email_user,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        },
        'meta': 'request.META'
    }
    response_data['result'] = 'error'
    response_data['message'] = 'Some error message'

    resp = HttpResponse(json.dumps(response_data), content_type="application/json")
    # resp["Access-Control-Allow-Origin"] = "*"
    resp["Access-Control-Allow-Origin"] = "http://localhost:3006"

    # resp["Access-Control-Allow-Origin"] = (string)context.Request.Headers["Origin"] });
    resp["Access-Control-Allow-Headers"] =  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    resp["Access-Control-Allow-Methods"] =  "GET, POST, PUT, DELETE, OPTIONS"
    resp["Access-Control-Allow-Credentials"] =  "true"
    

    return resp