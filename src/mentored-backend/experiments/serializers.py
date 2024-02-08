from rest_framework import serializers
from experiments.models import Experiment, ProjectRequest, Project, ExperimentExecution, LANGUAGE_CHOICES, STYLE_CHOICES
from django.http import HttpResponse


import sys, os
sys.path.append('mentored-master/core/')
from MentoredExperiment import MentoredExperiment


import tempfile
import yaml
import jsonschema

from multiprocessing import Process

from django.db import models

import time




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
        fields = ['id', 'url', 'exp_name', 'experiment_yaml_file', 'display_experiment_yaml_file']
        # fields = ['id', 'url', 'exp_name']

        # read_only_fields = ('is_active', 'is_staff')
        # extra_kwargs = {
        #     'password': {'write_only': True}
        # }
    
    display_experiment_yaml_file = serializers.SerializerMethodField(source='get_experiment_yaml_file')

    def get_display_experiment_yaml_file(self, obj):
        return obj.experiment_yaml_file_display()

    id = serializers.IntegerField(read_only=True)
    exp_name = serializers.CharField(style={'base_template': 'textarea.html'})
    experiment_yaml_file = serializers.FileField()
    # experiment_yaml_file = serializers.CharField(style={'base_template': 'textarea.html'})


    def create(self, validated_data):
        """
        Create and return a new `Experiment` instance, given the validated data.
        """
        return Experiment.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `Experiment` instance, given the validated data.
        """
        instance.exp_name = validated_data.get('exp_name', instance.exp_name)
        instance.experiment_yaml_file = validated_data.get('experiment_yaml_file', instance.experiment_yaml_file)
        instance.save()
        return instance
        

class ProjectRequestSerializer(serializers.Serializer):

    class Meta:
        model = ProjectRequest
        fields = ['id', 'url', 'project_name', 'request_text', 'accepted']

    id = serializers.IntegerField(read_only=True)
    project_name = serializers.CharField()
    # accepted = serializers.BooleanField()
    request_text = serializers.CharField(style={'base_template': 'textarea.html'})
    

    def create(self, validated_data):
        """
        Create and return a new `ProjectRequest` instance, given the validated data.
        """
        return ProjectRequest.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `ProjectRequest` instance, given the validated data.
        """
        instance.request_text = validated_data.get('request_text', instance.request_text)
        instance.project_name = validated_data.get('project_name', instance.project_name)
        instance.save()
        return instance

class ProjectSerializer(serializers.Serializer):
    class Meta:
        model = Project
        fields = ['id', 'url', 'project_name', 'project_request', 'kube_config']


    id = serializers.IntegerField(read_only=True)
    project_name = serializers.CharField()
    namespace_name = serializers.CharField()
    kube_config = serializers.CharField(style={'base_template': 'textarea.html'})
    project_request = ProjectRequestSerializer(many=False)
    

    '''
    def create(self, validated_data):
        """
        Create and return a new `Project` instance, given the validated data.
        """
        return Project.objects.create(**validated_data)
    '''

    def create(self, validated_data):
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



    def update(self, instance, validated_data):
        """
        Update and return an existing `Project` instance, given the validated data.
        """
        
        instance.project_name = validated_data.get('project_name', instance.project_name)
        instance.kube_config = validated_data.get('kube_config', instance.kube_config)
        instance.namespace_name = validated_data.get('namespace_name', instance.kube_config)
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
        fields = ['id', 'url', 'created', 'project', 'experiment', 'status', 'execution_time']
        # ordering = ['id']
    
    
    
    id = serializers.IntegerField(read_only=True)
    # project = ProjectSerializer(many=False)
    project = ProjectPrimaryKeyRelatedField(many=False, queryset=Project.objects.all().order_by('-id'), read_only=False)
    # experiment = ExperimentSerializer(many=False)
    experiment = ExperimentPrimaryKeyRelatedField(many=False, queryset=Experiment.objects.all().order_by('-id'), read_only=False)
    # test = serializers.IntegerField()
    status = serializers.IntegerField(read_only=True)
    # execution_time = IntegerRangeField(min_value=1, max_value=600)
    execution_time = serializers.IntegerField(min_value=1, max_value=3600)



    '''
    def create(self, validated_data):
        """
        Create and return a new `ExperimentExecution` instance, given the validated data.
        """
        return ExperimentExecution.objects.create(**validated_data)
    '''

    def create(self, validated_data):
        project = None
        experiment = None
        print(validated_data)

        '''
        if 'project' in validated_data:
            project_data = validated_data.pop('project')
            if 'project_request' in project_data:
                project_request_data = project_data.pop('project_request')
                project_request = ProjectRequest.objects.create(**project_request_data)
                project = Project.objects.create(project_request=project_request, **project_data)
            else:
                project = Project.objects.create(**project_data)
            
        if 'experiment' in validated_data:
            experiment_data = validated_data.pop('experiment')
            experiment = Experiment.objects.create(**experiment_data)
        '''
        project = validated_data.pop('project')
        experiment = validated_data.pop('experiment')
        
        experiment_execution = ExperimentExecution.objects.create(experiment=experiment, project=project, **validated_data)
        
        # def trigger_f(exp_id, username, experiment_yaml_file):
        #     exp = ExperimentExecution.get(exp_id)
        #     exp.delete()

        # exp_ment = MentoredExperiment.create(experiment_execution.id, username, experiment_yaml_file, trigger_f)

        # exp_ment == '/home/bruno/kube_config_keys/brunomeyer/1.yaml'

        # experiment_execution.kube_config = exp_ment

        # namespace = 'mvp1'
        # namespace = 'mentored-lab1'
        namespace = project.namespace_name
        user = self.context['request'].user
        # user_name = user.username
        user_name = user.pk # Primary key
        exp_id = experiment_execution.id

        experiment_execution.user_name = user_name
        experiment_execution.save()

        # me = MentoredExperiment(namespace, user_name=user_name, exp_id=exp_id)
        
        # yaml_data = experiment.experiment_yaml_file

        # print(yaml_data)
        # return experiment_execution

        # with open(f"{d_name}.yaml", "w") as f:
        #     yaml_data = yaml.dump(body)
        #     f.write(yaml_data)

        experiment_execution.run()

            
        
        return experiment_execution

        # tracks_data = validated_data.pop('tracks')
        # album = Album.objects.create(**validated_data)
        # for track_data in tracks_data:
        #     Track.objects.create(album=album, **track_data)
        # return album



    # def update(self, instance, validated_data):
    #     """
    #     Update and return an existing `ExperimentExecution` instance, given the validated data.
    #     """
    #     instance.project_name = validated_data.get('project_name', instance.project_name)
    #     instance.project_request = validated_data.get('project_request', instance.project_request)
    #     instance.save()
    #     return instance

