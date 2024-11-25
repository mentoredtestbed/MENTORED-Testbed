import base64
from django.http import HttpResponse, JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User, Group
from django.shortcuts import redirect, get_object_or_404
from experiments.models import Experiment, Notification, ProjectInviteNotification, ProjectRequest, Project, ExperimentExecution, ComanageUser, SystemNotification, ClusterInfo, get_kubeconfig_path
from experiments.serializers import ExperimentSerializer, NotificationSerializer, ProjectRequestSerializer, ProjectSerializer, ExperimentExecutionSerializer, ComanageUserSerializer, UserSerializer, AddMemberSerializer, ClusterInfoSerializer
from rest_framework.parsers import JSONParser
from rest_framework import viewsets
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .utils import ROLE_PROJECT_LEADER, ROLE_PROJECT_MANAGER, ROLE_EXPERIMENTER, ROLE_ADMIN
from .utils import IsMemberOfProject, IsMemberOfAnyProject, IsSuperUser, get_user_status_and_organization, get_co_person, get_user_role, IsAdmin, get_project_user_role, edit_project_user_role, remove_project_user_role, get_all_project_user_role
from comanage.comanage_api_request import ComanageApiRequest

from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout

import json
import os

from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import action

from django.conf import settings

class ProjectMemberViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = []

    def get_queryset(self):
        self.project_id = self.kwargs.get('project_id')
        if self.project_id:
            try:
                project = Project.objects.get(id=self.project_id)
                return project.users.all()
            except Project.DoesNotExist:
                return User.objects.none()
        else:
            return User.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serialized_data = []
        for user in queryset:
            user_co_person_id = user.comanageuser.co_person_id
            print("User Co Person Id", user_co_person_id)
            external_data = self.fetch_external_data(user_co_person_id) #request to retrieve user data from comanage

            serializer = self.get_serializer(user, context={'external_data': external_data})
            serialized_data.append(serializer.data)
            print("Serializer", serializer)

        print("Serialized Data", serialized_data)
        return Response(serialized_data)

    def fetch_external_data(self, co_person_id):
        print("project_id", self.project_id)
        project = Project.objects.get(id=self.project_id)
        print("project_cou_id", project.cou_id)
        try:
            car = ComanageApiRequest()
            print("Getting Names")
            user_response = car.get_response_json(car.get_names(co_person_id)).get('Names')
            print("Names", user_response)
            user_role_response = car.get_response_json(car.get_coperson_role(person_id = co_person_id))
            print("Roles", user_role_response)
            user_role_object = None
            if "CoPersonRoles" in user_role_response:
                for role in user_role_response["CoPersonRoles"]:
                    print("Role", role)
                    if role.get("CouId") == project.cou_id:
                        user_role_object = role
                        break
            user_role = user_role_object.get("Title")
            print("UserRole", user_role)
            user_response[0]['UserRole'] = user_role
        except Exception as e:
            print(f"No COmanage: {e}")
            user_response = []
            user_response.append("NoCOmanage")

        return user_response[0]

    def add_member(self, request, project_id=None):
        serializer = AddMemberSerializer(data=request.data)
        if serializer.is_valid():
            try:
                print("Finding User", serializer.validated_data['user_email'])
                user = User.objects.get(email = serializer.validated_data['user_email'])
                print("User Found", user)
                print("Finding Project", project_id)
                project = Project.objects.get(id=project_id)
                print("Project found", project)
                print("Adding user to the project")
                project.users.add(user)
                print("User added to the project")
                print("Acessing COmanage")
                car = ComanageApiRequest()
                user_co_person_id = user.comanageuser.co_person_id
                response_aff = car.get_response_json(car.get_coperson_role(user_co_person_id))
                if response_aff:
                    user_aff = response_aff.get('CoPersonRoles')[0].get('Affiliation')
                    add_role_response = car.add_coperson_role(role_name = ROLE_EXPERIMENTER, project_id = project.cou_id, person_id = user_co_person_id, person_affiliation = user_aff)
                    print("Role added to user in COmanage")
                return Response({'status': 'user added'}, status=status.HTTP_200_OK)
            except Project.DoesNotExist:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #@action(detail=True, methods=['delete'], url_path='remove_member')
    def remove_member(self, request, project_id=None, user_id=None):
        print(f"-----------------------Removing User {user_id} from Project {project_id} --------------------------")
        try:
            user = User.objects.get(id = user_id)
            print("User Found", user)
            print("Finding Project", project_id)
            project = Project.objects.get(id=project_id)
            print("Project found", project)

            print("Acessing COmanage")
            delete_resp = remove_project_user_role(request, cou_id = project.cou_id, user_co_person_id = user.comanageuser.co_person_id)
            print("removing user from the project", delete_resp)
            if delete_resp == "Ok":
                project.users.remove(user)
                print("User removed from the project")
            print("Role removed from user in COmanage")
            return Response({'status': 'User removed'}, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ComanageUserViewSet(viewsets.ModelViewSet):
    queryset = ComanageUser.objects.all()
    serializer_class = ComanageUserSerializer
    permission_classes = []

class ClusterInfoViewSet(viewsets.ModelViewSet):
    queryset = ClusterInfo.objects.all()
    serializer_class = ClusterInfoSerializer
    permission_classes = []

class ExperimentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Experiment.objects.all().order_by('-created')
    serializer_class = ExperimentSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Any user can fork a experiment
    @swagger_auto_schema(
        method='post',
        operation_description="Duplicate an Experiment Definition instance",
        responses={200: ExperimentSerializer()},
        manual_parameters=[
            openapi.Parameter(
                'project',
                openapi.IN_QUERY,
                description="ID of the project to associate with the duplicated instance",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'exp_name',
                openapi.IN_QUERY,
                description="Name of the duplicated instance",
                type=openapi.TYPE_STRING
            ),
        ]
    )
    @action(detail=True, methods=['post'], url_path='fork')
    def fork(self, request, pk=None):
        """
        Duplicates the specified instance of Experiment.
        The new instance can be associated with a different project by providing a `project` ID.

        **Parameters**:
        - `project` (int): Optional. The ID of the project to associate with the duplicated instance.
        - `exp_name` (str): Optional. The name of the duplicated instance.
        """
        # experiment = self.get_object()
        experiment = get_object_or_404(Experiment, pk=pk)

        project_id = request.data.get('new_project_id')
        exp_name = request.data.get('new_exp_name')

        new_experiment = experiment.fork(
            self.request.user,
            project_id=project_id,
            exp_name=exp_name,
        )
        serializer = self.get_serializer(new_experiment)
        return Response(serializer.data)

    def pre_save(self, obj):
        file = self.request.FILES.get('file')
        # project_id = self.request.data.get('project')
        # project = Project.objects.get(id=project_id)
        # namespace = project.namespace_name

        # yaml_file_data = file.read()
        # yaml_file_data = yaml.load(yaml_file_data)
        # valid, error_msg = Experiment.validate_yaml(yaml_file_data, namespace)
        # print("Valid", valid)
        # print("Error", error_msg)
        # if not valid:
        #     # HTTP response with error
        #     return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

        obj.experiment_yaml_file = file

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        # Filter by projects that the user is in
        user = self.request.user

        # projects that user is in

        is_admin_permission = IsAdmin()

        if is_admin_permission.has_permission(self.request, self) or bool(user and user.is_superuser):
            projects = Project.objects.all()
        else:
            projects = user.projects.all()

        # experiments that are in the projects that the user is in
        return Experiment.objects.filter(project__in=projects).order_by('-created')

    def create(self, *args, **kwargs):
        return super().create(*args, **kwargs)

class ExperimentListViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    serializer_class = ExperimentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by projects that the user is in
        project_id = self.kwargs.get('project_id')
        if project_id:
            try:
                current_project = Project.objects.get(id=project_id)
                return Experiment.objects.filter(project=current_project).order_by('-created')
            except Project.DoesNotExist:
                return Experiment.objects.none()
        else:
            return Experiment.objects.none()

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Notification.objects.all()

    def get_queryset(self):

        current_user = self.request.user
        is_admin_permission = IsAdmin()

        if is_admin_permission.has_permission(self.request, self) or bool(current_user and current_user.is_superuser):
            return Notification.objects.all().order_by('-created_at')
        return Notification.objects.filter(user=current_user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            notification = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = ProjectRequest.objects.all().order_by('-project_request_created')
    serializer_class = ProjectRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        project_name = request.data.get('project_name')
        project_request_subject = request.data.get('project_request_subject')
        latest_project_request = ProjectRequest.objects.filter(project_name=project_name).order_by('-project_request_created').first()
        # Check if a lastest project request with the same project_name and project_request_subject already exists
        if latest_project_request and latest_project_request.project_request_subject == project_request_subject:
            return Response({'error': 'The latest project request with this project_name already has the same project_request_subject.'}, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        current_user = self.request.user
        is_admin_permission = IsAdmin()

        if is_admin_permission.has_permission(self.request, self) or bool(current_user and current_user.is_superuser):
            return ProjectRequest.objects.all().order_by('-project_request_created')

        return ProjectRequest.objects.filter(user=current_user, project_request_subject='Creation').order_by('-project_request_created')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.project_acceptance == 'Idle': 
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Project request cannot be deleted because it is not idle.'}, status=status.HTTP_400_BAD_REQUEST)


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
        return super().create(*args, **kwargs)

    # Handle put
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        project = self.get_object()
        serializer = self.get_serializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        user = self.request.user
        is_admin_permission = IsAdmin()

        if is_admin_permission.has_permission(self.request, self) or bool(user and user.is_superuser):
            return Project.objects.all().order_by('-created')

        # projects that user is in
        return user.projects.all().order_by('-created')

class PublicProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    # queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    # permission_classes = [IsSuperUser]

    def get_queryset(self):
        user = self.request.user
        is_admin_permission = IsAdmin()

        if is_admin_permission.has_permission(self.request, self) or bool(user and user.is_superuser):
            return Project.objects.filter(project_request__project_visibility='Public')

        # projects that user is in
        return Project.objects.filter(project_request__project_visibility='Public', is_active=True).exclude(users=user)


class ExperimentExecutionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = ExperimentExecution.objects.all().order_by('-created')
    serializer_class = ExperimentExecutionSerializer
    # permission_classes = [permissions.IsAuthenticated, IsMemberOfProject]
    # permission_classes = [permissions.IsAuthenticated]
    # permission_classes = [IsSuperUser]
    # permission_classes = []
    permission_classes = []

    @swagger_auto_schema(
        method='get',
        operation_description="Download the data of the Experiment Execution instance",
        responses={200: ExperimentExecutionSerializer()},
    )
    @action(detail=True, methods=['get'], url_path='download_data')
    def download_data(self, request, pk=None):
        ee = ExperimentExecution.objects.get(id=pk)
        file_path = ee.get_experiment_data()
        download_name = os.path.basename(file_path)
        print("Download Name", file_path)
        if os.path.exists(file_path):
            with open(file_path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type="application/tar+gzip")
                response['Content-Disposition'] = 'inline; filename=' + download_name
                return response
        raise Http404

    def create(self, *args, **kwargs):
        user = self.request.user
        return super().create(*args, **kwargs, user=user)

    # TODO: On delete try to stop experiment

    def get_queryset(self):
        # Filter by projects that the user is in
        user = self.request.user

        # projects that user is in
        projects = user.projects.all()

        # experiments that are in the projects that the user is in
        return ExperimentExecution.objects.filter(project__in=projects).order_by('-created')

class ExperimentExecutionListViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    serializer_class = ExperimentExecutionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by projects that the user is in
        experiment_id = self.kwargs.get('experiment_id')
        if experiment_id:
            try:
                current_experiment = Experiment.objects.get(id=experiment_id)
                return ExperimentExecution.objects.filter(experiment=current_experiment).order_by('-created')
            except Project.DoesNotExist:
                return ExperimentExecution.objects.none()
        else:
            return ExperimentExecution.objects.none()


def project_request_get_kube_config(request, pk):
    # response = HttpResponse(content_type='text/yaml')
    # response['Content-Disposition'] = 'attachment; filename="config.yaml"'

    p = Project.objects.get(id=pk)
    content = p.kube_config
    response = HttpResponse(content, content_type='text/yaml')
    response['Content-Disposition'] = 'attachment; filename="config.yaml"'

    # run kubectl command to get only running pods

    return response

# TODO: Add authorization mechanism for custom routes


def experiment_execution_stop(request, pk):

    ee = ExperimentExecution.objects.get(id=pk)
    ee.stop(ee.experiment.experiment_yaml_file)

    return redirect('/api/experimentexecutions/{}'.format(pk))

def get_running_pods(request, pk):
    # pk = 128
    ee = ExperimentExecution.objects.get(id=pk)
    resp = ee.get_running_pods()

    return JsonResponse({
        "podnames": [{"podname": x, "namespace": ee.project.namespace_name} for x in resp],
        "progress": ee.progress,
        "status": ee.status
    })

def get_webkubectl_token(request):
    '''
    It is equivalent to the following curl command:
    curl -k https://host.docker.internal:8080/api/kube-config -X POST \
    -d '{\"name\":\"tmp-kubectl-access\","kubeConfig":"'$(base64 -w 0 /root/.kube/config)'"}'
    '''

    # TODO: Change the path to the kubeconfig file of the user

    filename = get_kubeconfig_path(request.user)
    # Get base64 encoded kubeconfig file
    with open(filename, "r") as f:
        kubeconfig = f.read()
        encoded_kubeconfig = base64.b64encode(kubeconfig.encode()).decode()

    if settings.RELEASE_MODE == "production":
        shell_cmd = "curl -k https://host.docker.internal/webkubectl/api/kube-config -X POST -d '{\"name\":\"tmp-kubectl-access\",\"kubeConfig\":\""+encoded_kubeconfig+"\"}'"
    else:
        shell_cmd = "curl -k http://nginx-server/webkubectl/api/kube-config -X POST -d '{\"name\":\"tmp-kubectl-access\",\"kubeConfig\":\""+encoded_kubeconfig+"\"}'"


    # Get output of shell command and transform from json to dict
    output = os.popen(shell_cmd).read()
    output_dict = json.loads(output)

    # Return the token
    return JsonResponse(output_dict)

def get_login_data(request):
    if settings.RELEASE_MODE != "production":
        # If not logged in return not allowed
        if not request.user.is_authenticated:
            if settings.RELEASE_MODE == "development":
                return JsonResponse({'error': 'User not authenticated'}, status=401)
        response_data = {
            'user': {
                'username': request.user.username,
                'pk': request.user.pk,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'status': 'Active',
                'is_admin': request.user.is_superuser
            },
            'meta': 'request.META'
        }
        response_data['result'] = 'error'
        response_data['message'] = 'Some error message 3'

        resp = HttpResponse(json.dumps(response_data), content_type="application/json")
        resp["Access-Control-Allow-Origin"] = "http://localhost:3006"
        resp["Access-Control-Allow-Headers"] =  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        resp["Access-Control-Allow-Methods"] =  "GET, POST, PUT, DELETE, OPTIONS"
        resp["Access-Control-Allow-Credentials"] =  "true"

        return resp
    response_user_status, response_user_organization, response_user_role = None, None, None
    try:
        # check user information in comanage
        print("Requesting user status on COmanage")
        response_user_status, response_user_organization = get_user_status_and_organization(request)
        # check if user is Active on COmanage, and then store the co_person_id
        print("Checking user status: ", response_user_status)
        if(response_user_status == "Active"):
            current_user = request.user
            comanage_user = ComanageUser.objects.get(user = current_user)
            if not comanage_user.co_person_id:
                print("Storing User Co Person ID for the first time")
                response_json = get_co_person(request)
                co_person_id = response_json.get('CoPeople')[0].get('Id')
                comanage_user.co_person_id = co_person_id
                comanage_user.save()

            print("Getting User Role")
            response_user_role = get_user_role(request)
    except ComanageUser.DoesNotExist:
        print("Error: ComanageUser does not exist for the current user")
        response_user_status = "NoUser"
        response_user_organization = "No Organization"
        response_user_role = "No Role"
    except KeyError as e:
        print(f"Error: Missing expected data in the response - {e}")
        response_user_status = "NoUser"
        response_user_organization = "No Organization"
        response_user_role = "No Role"
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        response_user_status = "NoUser"
        response_user_organization = "No Organization"
        response_user_role = "No Role"

    response_data = {
        'user': {
            'username': getattr(request.user, 'username', 'No Username'),
            'pk': getattr(request.user, 'pk', None),
            'email': getattr(request.user, 'email', 'No Email'),
            'first_name': getattr(request.user, 'first_name', 'No First Name'),
            'last_name': getattr(request.user, 'last_name', 'No Last Name'),
            'status': response_user_status,
            'organization': response_user_organization,
            'is_admin': response_user_role == 'Admin'
        },
        'meta': 'request.META'
    }
    response_data['result'] = 'error'
    response_data['message'] = 'Some error message 3'

    resp = HttpResponse(json.dumps(response_data), content_type="application/json")
    # resp["Access-Control-Allow-Origin"] = "*"
    resp["Access-Control-Allow-Origin"] = "http://localhost:3006"

    # resp["Access-Control-Allow-Origin"] = (string)context.Request.Headers["Origin"] });
    resp["Access-Control-Allow-Headers"] =  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    resp["Access-Control-Allow-Methods"] =  "GET, POST, PUT, DELETE, OPTIONS"
    resp["Access-Control-Allow-Credentials"] =  "true"


    return resp

@login_required
def logout_view(request):
    logout(request)
    return redirect('/')

def get_user_status_view(request):

    response_user_status = get_user_status(request)

    response_data = {
        'status': response_user_status
    }

    resp = HttpResponse(json.dumps(response_data), content_type="application/json")
    resp["Access-Control-Allow-Origin"] = "http://localhost:3006"

    resp["Access-Control-Allow-Headers"] =  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    resp["Access-Control-Allow-Methods"] =  "GET, POST, PUT, DELETE, OPTIONS"
    resp["Access-Control-Allow-Credentials"] =  "true"

    return resp

def get_user_role_view(request):

    user_role = get_user_role(request)

    response_data = {
        'user_role': user_role
    }

    resp = HttpResponse(json.dumps(response_data), content_type="application/json")
    resp["Access-Control-Allow-Origin"] = "http://localhost:3006"

    resp["Access-Control-Allow-Headers"] =  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    resp["Access-Control-Allow-Methods"] =  "GET, POST, PUT, DELETE, OPTIONS"
    resp["Access-Control-Allow-Credentials"] =  "true"

    return resp


def get_project_user_role_view(request, project_id):
    print("Project", project_id)
    user_role = get_project_user_role(request, project_id)

    response_data = {
        'user_role': user_role
    }

    resp = HttpResponse(json.dumps(response_data), content_type="application/json")
    resp["Access-Control-Allow-Origin"] = "http://localhost:3006"

    resp["Access-Control-Allow-Headers"] =  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    resp["Access-Control-Allow-Methods"] =  "GET, POST, PUT, DELETE, OPTIONS"
    resp["Access-Control-Allow-Credentials"] =  "true"

    return resp


def get_all_project_user_role_view(request):
    print("Getting ALL Project User Role")
    user_role = get_all_project_user_role(request)
    response_data = user_role

    resp = HttpResponse(json.dumps(response_data), content_type="application/json")
    resp["Access-Control-Allow-Origin"] = "http://localhost:3006"

    resp["Access-Control-Allow-Headers"] =  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    resp["Access-Control-Allow-Methods"] =  "GET, POST, PUT, DELETE, OPTIONS"
    resp["Access-Control-Allow-Credentials"] =  "true"

    return resp

def edit_project_user_role_view(request, project_id):
    print("-----------------------------------------------------------")
    if request.method == 'POST':
        data = json.loads(request.body)
        role_name = data.get('role_name')
        user_email = data.get('user_email')
        print('role_name', role_name)
        print('user_email', user_email)
        if role_name is None:
            return Response({'error': 'role_name is required'}, status=status.status.HTTP_400_BAD_REQUEST)#JsonResponse({'error': 'role_name is required'}, status=400)
        if user_email is None:
            return Response({'error': 'user_email is required'}, status=status.status.HTTP_400_BAD_REQUEST)#JsonResponse({'error': 'user_email is required'}, status=400)

        print("Project", project_id)
        edit_user_role = edit_project_user_role(request, project_id, role_name, user_email)

        response_data = {
            'status': edit_user_role
        }

        return Response(response_data, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

def get_project_with_name(request, project_name):

    exists = Project.objects.filter(project_name=project_name).exists()

    return JsonResponse({'exists': exists})

def get_cluster_info(request):
    print("Getting Cluster Info")

    # TODO: In future, assumes that users can access multiple clusters from multiple projects
    # Obtain the first project of the user
    p = request.user.projects.first()

    cinfo = ClusterInfo.get_cluster_info(project=p, user=request.user)
    return JsonResponse(cinfo)