from rest_framework import serializers
from experiments.models import Experiment, ProjectRequest, Project, ExperimentExecution, ComanageUser, Notification, ProjectInviteNotification, SystemNotification, LANGUAGE_CHOICES, STYLE_CHOICES, VISIBILITY_CHOICES, PROJECT_ACCEPTANCE_CHOICES, PROJECT_REQUEST_TYPE_CHOICES, PROJECT_CURRENT_STATUS_CHOICES, NOTIFICATION_TYPE_MESSAGE_CHOICES
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from comanage.comanage_api_request import ComanageApiRequest
from .utils import ROLE_PROJECT_LEADER, ROLE_PROJECT_MANAGER, ROLE_EXPERIMENTER, ROLE_ADMIN, generateNamespace
import sys, os
sys.path.append('mentored-master/core/')
from MentoredExperiment import MentoredExperiment

import tempfile
import yaml
import jsonschema

from multiprocessing import Process

from django.db import models
from django.db.models import Q

import time
from django.conf import settings

class NotificationSerializer(serializers.ModelSerializer):
    invite_notification = serializers.SerializerMethodField(method_name='get_invite_notification')
    system_notification = serializers.SerializerMethodField(method_name='get_system_notification')

    class Meta:
        model = Notification
        fields = ['id', 'user', 'user_email', 'type', 'created_at', 'read', 'invite_notification', 'system_notification']
        read_only_fields = ['user', 'created_at']

    user_email = serializers.CharField(write_only=True)
    type = serializers.ChoiceField(choices=NOTIFICATION_TYPE_MESSAGE_CHOICES)
    created_at = serializers.DateTimeField(read_only=True)
    read = serializers.BooleanField()

    def create(self, validated_data):
        print("user_email - teste 1")
        user_email = validated_data.pop('user_email')
        try:
            print("user_email - teste 2")
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'user_email': 'User not found.'})

        print("user_email - teste 3")
        validated_data['user'] = user
        notification = super().create(validated_data)

        if notification.type == 'Invite':
            self.handle_invite_notification(notification)
        elif notification.type == 'System':
            self.handle_system_notification(notification)

        return notification

    def handle_invite_notification(self, notification):
        project_name = self.initial_data.get('project_name')
        project_id = self.initial_data.get('project_id')
        user_email = self.initial_data.get('user_email')

        if ProjectInviteNotification.objects.filter(
                Q(notification__user=notification.user) & 
                Q(project_id=project_id) & 
                Q(project_name=project_name) & 
                Q(user_email=user_email)
            ).exists():
            notification.delete()
            raise serializers.ValidationError({'error': 'Invite notification already exists.'})

        try:
            project = Project.objects.get(id=project_id)
            if notification.user in project.users.all():
                notification.delete()
                raise serializers.ValidationError({'error': 'User is already part of the project.'})
        except Project.DoesNotExist:
            notification.delete()
            raise serializers.ValidationError({'error': 'Project not found.'})

        ProjectInviteNotification.objects.create(
            notification=notification,
            project_name=project_name,
            project_id=project_id,
            user_email=user_email
        )

    def handle_system_notification(self, notification):
        message = self.initial_data.get('message')
        if not message:
            notification.delete()
            raise serializers.ValidationError({'error': 'No notification message sent.'})

        SystemNotification.objects.create(
            notification=notification,
            message=message
        )

    def get_invite_notification(self, obj):
        print("teste456")
        if obj.type == 'Invite':
            try:
                print("InviteSerializer")
                invite_notification = ProjectInviteNotification.objects.get(notification=obj)
                return ProjectInviteNotificationSerializer(invite_notification).data
            except ProjectInviteNotification.DoesNotExist:
                return None
        return None


    def get_system_notification(self, obj):
        print("teste123")
        if obj.type == 'System':
            try:
                print("SystemSerializer")
                system_notification = SystemNotification.objects.get(notification=obj)
                return SystemNotificationSerializer(system_notification).data
            except SystemNotification.DoesNotExist:
                return None
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if representation.get('invite_notification') is None:
            representation.pop('invite_notification')
        if representation.get('system_notification') is None:
            representation.pop('system_notification')

        return representation

class ProjectInviteNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectInviteNotification
        fields = ['project_name', 'project_id', 'user_email']

    project_name = serializers.CharField(max_length=100)
    project_id = serializers.IntegerField()
    user_email = serializers.CharField(max_length=100)

class SystemNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemNotification
        fields = ['message']

    message = serializers.CharField()

class AddMemberSerializer(serializers.Serializer):
    user_email = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    external_data = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'external_data']

    def get_external_data(self, obj):
        return self.context.get('external_data', {})

class ComanageUserSerializer(serializers.Serializer):
    class Meta:
        model = ComanageUser
        fields = '__all__'

    user = UserSerializer(read_only=True)
    co_person_id = serializers.IntegerField()

class IntegerRangeField(models.IntegerField):
    def __init__(self, verbose_name=None, name=None, min_value=None, max_value=None, **kwargs):
        self.min_value, self.max_value = min_value, max_value
        models.IntegerField.__init__(self, verbose_name, name, **kwargs)
    def formfield(self, **kwargs):
        defaults = {'min_value': self.min_value, 'max_value':self.max_value}
        defaults.update(kwargs)
        return super(IntegerRangeField, self).formfield(**defaults)


class ProjectRequestListingField(serializers.RelatedField):
    queryset = ProjectRequest.objects.all()
    view_name = 'project_name'

    def display_value(self, instance):
        return instance.project_name

    def to_representation(self, value):
        return value.project_name

    def to_internal_value(self, value):
        return value


class ProjectPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def display_value(self, instance):
        return 'Projeto: %s' % (instance.project_name)

class ExperimentPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def display_value(self, instance):
        return 'Experimento: %s' % (instance.exp_name)


# class ExperimentSerializer(serializers.Serializer):
class ExperimentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Experiment
        # fields = ['url', 'username', 'email', 'groups', 'password']
        # fields = ['id', 'url', 'exp_name', 'experiment_yaml_file', 'user']
        fields = [
            'id',
            'url',
            'exp_name',
            'experiment_yaml_file',
            'display_experiment_yaml_file',
            'all_versions_display',
            'lastVersionNumber',
            'user',
            'project',
            'parent',
            'children',
        ]
        # fields = ['id', 'url', 'exp_name']

        # read_only_fields = ('is_active', 'is_staff')
        # extra_kwargs = {
        #     'password': {'write_only': True}
        # }

    display_experiment_yaml_file = serializers.SerializerMethodField(source='get_experiment_yaml_file')
    all_versions_display = serializers.SerializerMethodField(source='get_all_versions_display')

    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), default=None)
    project = ProjectPrimaryKeyRelatedField(many=False, queryset=Project.objects.all().order_by('-id'), read_only=False)
    parent = serializers.PrimaryKeyRelatedField(
        many=False,
        queryset=Experiment.objects.all().order_by('-id'),
        required=False,
        allow_empty=True
    )
    children = serializers.PrimaryKeyRelatedField(
        many=True,
        required=False,
        read_only=True
    )

    def get_display_experiment_yaml_file(self, obj):
        return obj.experiment_yaml_file_display()

    def get_all_versions_display(self, obj):
        return obj.get_all_versions_display()

    id = serializers.IntegerField(read_only=True)
    lastVersionNumber = serializers.IntegerField(read_only=True)
    exp_name = serializers.CharField(style={'base_template': 'textarea.html'})
    experiment_yaml_file = serializers.FileField()
    # experiment_yaml_file = serializers.CharField(style={'base_template': 'textarea.html'})

    def validate(self, validated_data):
        file = validated_data.get('experiment_yaml_file')
        project_id = validated_data.get('project').id
        project = Project.objects.get(id=project_id)
        namespace = project.namespace_name
        user = self.context['request'].user

        yaml_file_data = file.read()
        try:
            yaml_file_data = yaml.safe_load(yaml_file_data)
        except yaml.YAMLError as exc:
            # Get the specific error and line in the YAML
            if hasattr(exc, 'problem_mark'):
                mark = exc.problem_mark
                raise serializers.ValidationError(
                    {'error': f'Invalid YAML file at line {mark.line + 1}, column {mark.column + 1}.'})
            else:
                raise serializers.ValidationError({'error': 'Invalid YAML file.'})
        valid, err_msg = Experiment.validate_yaml(yaml_file_data, namespace, user)

        if not valid:
            # HTTP response with error
            raise serializers.ValidationError({'error': err_msg})

        return super().validate(validated_data)

    def create(self, validated_data):
        """
        Create and return a new `Experiment` instance, given the validated data.
        """
        # Get experiment yaml file
        file = validated_data.pop('experiment_yaml_file')
        new_experiment = Experiment.objects.create(**validated_data)
        new_experiment.save()
        new_experiment.experiment_yaml_file = file
        new_experiment.save()
        return new_experiment

    def update(self, instance, validated_data):
        """
        Update and return an existing `Experiment` instance, given the validated data.
        """

        instance.exp_name = validated_data.get('exp_name', instance.exp_name)
        instance.save()
        instance.experiment_yaml_file = validated_data.get('experiment_yaml_file', instance.experiment_yaml_file)
        instance.save()
        return instance


class ProjectRequestSerializer(serializers.Serializer):

    class Meta:
        model = ProjectRequest
        fields = '__all__'#['id', 'user_name', 'user_email', 'user_organization', 'project_request_created','project_name','project_description','project_identifier','project_website','project_visibility','project_resource_x86','project_resource_x86_xlarge','project_resource_x86_large','project_resource_x86_small','project_resource_x86_xsmall','project_resource_arm','project_resource_arm_large','project_resource_arm_small','project_acceptance']


    id = serializers.IntegerField(read_only=True)

    # User Info
    user_name = serializers.CharField(max_length=50)
    user_email = serializers.CharField(max_length=100)
    user_organization = serializers.CharField(max_length=100)
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    # Project Info
    project_request_created = serializers.DateTimeField(read_only=True)
    project_name = serializers.CharField(max_length=100)
    project_description = serializers.CharField()
    project_identifier = serializers.CharField(max_length=50)
    project_website = serializers.CharField(max_length=100, required=False, allow_blank=True)
    project_visibility = serializers.ChoiceField(choices=VISIBILITY_CHOICES)

    # Project Resources x86
    project_resource_x86 = serializers.BooleanField()
    project_resource_x86_xlarge = serializers.CharField(max_length=50, required=False, allow_blank=True)
    project_resource_x86_large = serializers.CharField(max_length=50, required=False, allow_blank=True)
    project_resource_x86_small = serializers.CharField(max_length=50, required=False, allow_blank=True)
    project_resource_x86_xsmall = serializers.CharField(max_length=50, required=False, allow_blank=True)

    # Project Resources ARM
    project_resource_arm = serializers.BooleanField()
    project_resource_arm_large = serializers.CharField(max_length=50, required=False, allow_blank=True)
    project_resource_arm_small = serializers.CharField(max_length=50, required=False, allow_blank=True)

    project_id = serializers.IntegerField(required=False)
    project_request_subject = serializers.ChoiceField(choices=PROJECT_REQUEST_TYPE_CHOICES)
    current_project_status = serializers.ChoiceField(choices=PROJECT_CURRENT_STATUS_CHOICES, required=False)
    project_admin_response = serializers.CharField(required=False, allow_blank=True)
    project_acceptance = serializers.ChoiceField(choices=PROJECT_ACCEPTANCE_CHOICES)


    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if not instance.project_website:
            representation.pop('project_website', None)

        if not instance.project_resource_x86:
            representation.pop('project_resource_x86_xlarge', None)
            representation.pop('project_resource_x86_large', None)
            representation.pop('project_resource_x86_small', None)
            representation.pop('project_resource_x86_xsmall', None)

        if not instance.project_resource_arm:
            representation.pop('project_resource_arm_large', None)
            representation.pop('project_resource_arm_small', None)

        return representation

    def create(self, validated_data):
        """
        Create and return a new `ProjectRequest` instance, given the validated data.
        """
        validated_data['user'] = self.context['request'].user
        return ProjectRequest.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `ProjectRequest` instance, given the validated data.
        """
        instance.user_name = validated_data.get('user_name', instance.user_name)
        instance.user_email = validated_data.get('user_email', instance.user_email)
        instance.user_organization = validated_data.get('user_organization', instance.user_organization)
        instance.project_request_created = validated_data.get('project_request_created', instance.project_request_created)
        instance.project_name = validated_data.get('project_name', instance.project_name)
        instance.project_description = validated_data.get('project_description', instance.project_description)
        instance.project_identifier = validated_data.get('project_identifier', instance.project_identifier)
        instance.project_website = validated_data.get('project_website', instance.project_website)
        instance.project_visibility = validated_data.get('project_visibility', instance.project_visibility)
        instance.project_resource_x86 = validated_data.get('project_resource_x86', instance.project_resource_x86)
        instance.project_resource_x86_xlarge = validated_data.get('project_resource_x86_xlarge', instance.project_resource_x86_xlarge)
        instance.project_resource_x86_large = validated_data.get('project_resource_x86_large', instance.project_resource_x86_large)
        instance.project_resource_x86_small = validated_data.get('project_resource_x86_small', instance.project_resource_x86_small)
        instance.project_resource_x86_xsmall = validated_data.get('project_resource_x86_xsmall', instance.project_resource_x86_xsmall)
        instance.project_resource_arm = validated_data.get('project_resource_arm', instance.project_resource_arm)
        instance.project_resource_arm_large = validated_data.get('project_resource_arm_large', instance.project_resource_arm_large)
        instance.project_resource_arm_small = validated_data.get('project_resource_arm_small', instance.project_resource_arm_small)
        instance.project_id = validated_data.get('project_id', instance.project_id)
        instance.current_project_status = validated_data.get('current_project_status', instance.current_project_status)
        instance.project_admin_response = validated_data.get('project_admin_response', instance.project_admin_response)
        instance.project_request_subject = validated_data.get('project_request_subject', instance.project_request_subject)
        instance.project_acceptance = validated_data.get('project_acceptance', instance.project_acceptance)
        instance.save()
        return instance

class ProjectSerializer(serializers.Serializer):
    class Meta:
        model = Project
        fields = ['id', 'url', 'project_name', 'project_request', 'kube_config', 'users', 'cou_id', 'is_active']

    users = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), read_only=False)

    id = serializers.IntegerField(read_only=True)
    project_name = serializers.CharField()
    namespace_name = serializers.CharField()
    kube_config = serializers.CharField(style={'base_template': 'textarea.html'})
    project_request = ProjectRequestSerializer(many=False)
    cou_id = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField()
    '''
    def create(self, validated_data):
        """
        Create and return a new `Project` instance, given the validated data.
        """
        return Project.objects.create(**validated_data)
    '''

    def create_with_namespace(self, validated_data):
        if 'project_request' in validated_data:
            project_request_data = validated_data.pop('project_request')
            project_request = ProjectRequest.objects.create(**project_request_data)
            project = Project.objects.create(project_request=project_request, **validated_data)
        else:
            project = Project.objects.create(**validated_data)

        project.create_k8s_namespace()
        project.create_knetlab_operator_viewer()


        # import subprocess

        # ns = project.namespace_name


        # cmd = f"/home/bruno/new-lab.sh apply {ns}"
        # output_create_ns = subprocess.check_output(cmd, shell=True, universal_newlines=True)
        # time.sleep(2)
        # cmd_check_ready = f"kubectl get pods --kubeconfig=/home/bruno/.kube/config -n {ns} -o=jsonpath='{{range .items[*]}}{{.status.containerStatuses[0].ready}}{{\"\\n\"}}{{end}}'"
        # output_check = subprocess.check_output(cmd_check_ready, shell=True, universal_newlines=True)
        # while output_check.replace("\n", "") != 'true':
        #     time.sleep(1)
        #     output_check = subprocess.check_output(cmd_check_ready, shell=True, universal_newlines=True)



        # # cmd = f"kubectl get pods -n {ns} -o=jsonpath='{{range .items[*]}}{{.metadata.name}}{{\"\\n\"}}{{end}} --kubeconfig=/home/bruno/.kube/config' | grep operator"
        # cmd = f"kubectl get pods --kubeconfig=/home/bruno/.kube/config -n {ns} -o=jsonpath='{{range .items[*]}}{{.metadata.name}}{{\"\\n\"}}{{end}}' | grep operator"
        # # print(cmd)
        # operator_pod_name = subprocess.check_output(cmd, shell=True, universal_newlines=True).replace("\n","")

        # port_id = 9000+project.id
        # # port_id = 8080+project.id
        # # port_id = 9000
        # cmd_fwd = f"time kubectl port-forward --address 0.0.0.0 --kubeconfig=/home/bruno/.kube/config {operator_pod_name} {port_id}:8080 -n {ns}"
        # # print(cmd_fwd)
        # fwd_output=subprocess.Popen(cmd_fwd.split(" "))
        # # fwd_output = subprocess.check_output(cmd, shell=True, universal_newlines=True).replace("\n","")


        # print(operator_pod_name)
        # print(fwd_output)
        # os.system('cat ~/new-lab.yaml | sed -e "s/LABNAME/$2/g" | kubectl $1 -f -')

        # kube_config_path = ''

        # project.kube_config = read(kube_config_path)

        # create_namespace()

        return project

        # tracks_data = validated_data.pop('tracks')
        # album = Album.objects.create(**validated_data)
        # for track_data in tracks_data:
        #     Track.objects.create(album=album, **track_data)
        # return album


    def create(self, validated_data):
        """
        Update and return an existing `Project` instance, given the validated data.
        """
        print(validated_data)
        if 'users' in validated_data:
            users = validated_data.pop('users')

        if settings.RELEASE_MODE != "production":
            project_request_data = validated_data.pop('project_request')
            project_request = ProjectRequest.objects.create(
                **project_request_data,
            )
            instance = Project.objects.create(**validated_data, project_request=project_request)
            if users:
                for user in users:
                    instance.users.add(user)
            return instance
        users = []

        if 'project_request' in validated_data:
            project_request_data = validated_data.pop('project_request')
            print("project request data ", project_request_data)
            project_request = None
            try:
                project_request = ProjectRequest.objects.get(project_name = project_request_data['project_name'], project_identifier = project_request_data['project_identifier'])
                print("Project request found.")
            except ProjectRequest.DoesNotExist:
                print("Project request not found.")

            if not project_request:
                print("Project request doesn't exist, need to create one.")
                # Create a new ProjectRequest if it doesn't exist
                project_request = ProjectRequest.objects.create(**project_request_data)

            validated_data['kube_config'] = "Not in use"
            validated_data['namespace_name'] = generateNamespace()

            instance = Project.objects.create(**validated_data, project_request=project_request)
        else:
            instance = Project.objects.create(**validated_data, users=[])

        user = User.objects.get(email = project_request_data['user_email'])
        if user:
            instance.users.add(user)
            print("User stored in project. ", user)
            user_co_person_id = user.comanageuser.co_person_id
            print("Getting CO Person ID ", user_co_person_id)
            print("Accessing Comanage.")
            car = ComanageApiRequest()
            response_aff = car.get_response_json(car.get_coperson_role(user_co_person_id))
            if response_aff:
                user_aff = response_aff.get('CoPersonRoles')[0].get('Affiliation')
                print("User Aff response ", user_aff)
                response_cou = car.get_response_json(car.add_cou(project_name = instance.project_name)) # COU creation
                if response_cou:
                    print("COU response. ", response_cou)
                    cou_id = response_cou.get('Id')
                    instance.cou_id = cou_id
                    print("COU Created and COU ID stored. ", cou_id)
                    response_role = car.add_coperson_role(role_name = ROLE_PROJECT_LEADER, project_id = cou_id, person_id = user_co_person_id, person_affiliation = user_aff)
                    print("User Role response ", response_role)
                else:
                    instance.delete()
                    print("There is already a project with that name.")
                    return

        print("[INFO] ProjectSerializer.create: " + str(instance))
        if len(users) > 0:
            # users = validated_data.pop('users')
            # instance.users.clear()  # Optionally clear existing before adding new ones
            # for user in users:
            #     instance.users.add(user)
            print(users)

        instance.save()
        project_request.project_id = instance.id
        project_request.save()
        return instance

        # except Exception as e:
        #     print("[ERROR] ProjectSerializer.create: " + e)
        #     return None


    def update(self, instance, validated_data):
        """
        Update and return an existing `Project` instance, given the validated data.
        """

        instance.project_name = validated_data.get('project_name', instance.project_name)
        instance.kube_config = validated_data.get('kube_config', instance.kube_config)
        instance.namespace_name = validated_data.get('namespace_name', instance.namespace_name)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        print("TESTE", instance)
        try:
            print("INSTANCE", instance.project_request.current_project_status)
            if instance.is_active:
                instance.project_request.current_project_status = "Activated"
            else:
                instance.project_request.current_project_status = "Deactivated"

            instance.project_request.save()
            print("INSTANCE", instance.project_request.current_project_status)
        except ProjectRequest.DoesNotExist:
            print("Project request not found.")

        if 'users' in validated_data:
            users = validated_data.pop('users')
            instance.users.clear()  # Optionally clear existing before adding new ones
            for user in users:
                instance.users.add(user)

        instance.save()
        return instance

    # def delete(self, instance, validated_data):
    #     """
    #     Update and return an existing `Project` instance, given the validated data.
    #     """

    #     instance.project_name = validated_data.get('project_name', instance.project_name)
    #     instance.kube_config = validated_data.get('kube_config', instance.kube_config)
    #     instance.namespace_name = validated_data.get('namespace_name', instance.kube_config)
    #     instance.save()
    #     return instance

class ExperimentExecutionSerializer(serializers.Serializer):
    class Meta:
        model = ExperimentExecution
        fields = [
            'id',
            'url',
            'created',
            'project',
            'experiment',
            'status',
            'execution_time',
            'user',
            'progress',
            'experiment_data_size',
        ]

    id = serializers.IntegerField(read_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), default=None)
    created = serializers.DateTimeField(read_only=True)
    project = ProjectPrimaryKeyRelatedField(many=False, queryset=Project.objects.all().order_by('-id'), read_only=False)
    experiment = ExperimentPrimaryKeyRelatedField(many=False, queryset=Experiment.objects.all().order_by('-id'), read_only=False)
    status = serializers.IntegerField(read_only=True)

    # TODO: Add different limits based on user role
    execution_time = serializers.IntegerField(min_value=1, max_value=7200) # Default 2 hours
    progress = serializers.IntegerField(min_value=0, max_value=100, read_only=True)
    experiment_data_size = serializers.IntegerField(read_only=True)

    def create(self, validated_data):
        project = None
        experiment = None
        project = validated_data.pop('project')
        experiment = validated_data.pop('experiment')
        experiment_execution = ExperimentExecution.objects.create(
            experiment=experiment, project=project, **validated_data)

        user = self.context['request'].user
        # namespace = project.namespace_name
        # exp_id = experiment_execution.id

        experiment_execution.user = user
        experiment_execution.save()
        experiment_execution.run()

        return experiment_execution

class ClusterInfoSerializer(serializers.Serializer):
    class Meta:
        model = ExperimentExecution
        fields = [
            'last_update',
            'cluster_info',
            'namespace_name',
            'cluster_name',
        ]

    last_update = serializers.DateTimeField(read_only=True)
    cluster_info = serializers.JSONField(read_only=True)
    namespace_name = serializers.CharField(read_only=True)
    cluster_name = serializers.CharField(read_only=True)