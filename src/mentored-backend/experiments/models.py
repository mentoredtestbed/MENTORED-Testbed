import glob
import math
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from pygments.lexers import get_all_lexers
from pygments.styles import get_all_styles

from multiprocessing import Process

import sys, os
sys.path.append('mentored-master/core/')
from MentoredExperiment import MentoredExperiment
from MentoredExperimentValidator import MentoredExperimentValidator

import time

import subprocess
import signal

from django.contrib.auth.models import User # new

from django.conf import settings
from django.utils import timezone
import json

ROOT_KUBE_CONFIG_PATH = settings.DEFAULT_KUBECONFIG_PATH
IOT_KUBECONFIG_PATH = "/root/.kube/config.iot"
# IOT_USERS = ["bruno.h.meyer@outlook.com"]

ALTERNATIVE_CLUSTERS = {
    'IOT_USERS': {
        "emails": [
            # "bruno.h.meyer@outlook.com",
            "khalilsantana@hotmail.com",
            "egresso.gidlab@idp4.cafeexpresso.rnp.br",
        ],
        "kubeconfig_path": "/root/.kube/config.iot"
    },
    'KIND_CLUSTER': {
        "emails": [
            "aluno.gidlab@idp4.cafeexpresso.rnp.br"
        ],
        "kubeconfig_path": "/root/.kube/config.bruno"
    }
}

def get_kubeconfig_path(user):
    kc = ROOT_KUBE_CONFIG_PATH
    for clustername, cluster in ALTERNATIVE_CLUSTERS.items():
        if user and user.email in cluster['emails']:
            kc = cluster['kubeconfig_path']
            break
    return kc

LEXERS = [item for item in get_all_lexers() if item[1]]
LANGUAGE_CHOICES = sorted([(item[1][0], item[0]) for item in LEXERS])
STYLE_CHOICES = sorted([(item, item) for item in get_all_styles()])

VISIBILITY_CHOICES = (
    ('Public', 'Public'),
    ('Protected', 'Protected'),
    ('Private', 'Private'),
)

PROJECT_ACCEPTANCE_CHOICES = (
    ('Accepted', 'Accepted'),
    ('Idle', 'Idle'),
    ('Rejected', 'Rejected'),
)

PROJECT_REQUEST_TYPE_CHOICES = (
    ('Creation', 'Creation'),
    ('Deactivation', 'Deactivation'),
    ('Activation', 'Activation'),
)

PROJECT_CURRENT_STATUS_CHOICES = (
    ('Deactivated', 'Deactivated'),
    ('Activated', 'Activated'),
)

NOTIFICATION_TYPE_MESSAGE_CHOICES = (
    ('Invite', 'Invite'),
    ('System', 'System'),
)

CLUSTER_INFO_UPDATE_INTERVAL = 60

class ClusterInfo(models.Model):
    last_update = models.DateTimeField(auto_now_add=True)
    cluster_info = models.TextField(max_length=99999)
    namespace_name = models.CharField(max_length=100, default="grupo-1")
    cluster_name = models.CharField(max_length=100, default="mentored")

    @staticmethod
    def get_cluster_info(project=None, user=None, return_only_last=False):
        ns = project.namespace_name if project else "default"

        # Get last ClusterInfo object
        all_cluster_info = ClusterInfo.objects.filter(namespace_name=ns)
        last_cluster_info = all_cluster_info.last()
        if last_cluster_info:
            last_update = last_cluster_info.last_update
            now = timezone.now()
            delta = now - last_update
            if delta.total_seconds() < CLUSTER_INFO_UPDATE_INTERVAL:
                if return_only_last:
                    return json.loads(last_cluster_info.cluster_info)
                else:
                    return {
                        "data": [{
                            "workers_data": json.loads(ci.cluster_info),
                            "last_update": ci.last_update
                            }
                            for ci in all_cluster_info]
                    }

        kc = ROOT_KUBE_CONFIG_PATH
        # if user and user.email in IOT_USERS:
        #     kc = IOT_KUBECONFIG_PATH

        for clustername, cluster in ALTERNATIVE_CLUSTERS.items():
            if user and user.email in cluster['emails']:
                kc = cluster['kubeconfig_path']
                break

        me = MentoredExperiment(ns, host_data_path=settings.EXPERIMENT_DATA_PATH, kubeconfig_path=kc)

        # Add entry to ClusterInfo
        cluster_info = me.get_cluster_info()
        ci = ClusterInfo.objects.create(cluster_info=json.dumps(cluster_info), namespace_name=ns, cluster_name=kc)
        all_cluster_info = ClusterInfo.objects.filter(namespace_name=ns)

        if return_only_last:
            return cluster_info
        else:
            return {
                "data": [{
                    "workers_data": json.loads(ci.cluster_info),
                    "last_update": ci.last_update
                    }
                    for ci in all_cluster_info]
            }

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=40, choices=NOTIFICATION_TYPE_MESSAGE_CHOICES, default='Invite')
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

class ProjectInviteNotification(models.Model):
    notification = models.OneToOneField(Notification, on_delete=models.CASCADE, related_name='project_invite', null = True)
    project_name = models.CharField(max_length=200)
    project_id = models.IntegerField(null=True)
    user_email = models.CharField(max_length=100)

class SystemNotification(models.Model):
    notification = models.OneToOneField(Notification, on_delete=models.CASCADE, related_name='system', null = True)
    message = models.TextField(max_length=200, blank=True)
    message_timer = models.TextField(max_length=20, blank=True)
    message_sender = models.TextField(max_length=100, blank=True)

class ComanageUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    co_person_id = models.IntegerField(null=True)

class ProjectRequest(models.Model):

    # User Info
    user_name = models.CharField(max_length=50, null=True)
    user_email = models.CharField(max_length=100, null=True)
    user_organization = models.CharField(max_length=100, null=True)
    user = models.ForeignKey(User, related_name='project_request', on_delete=models.CASCADE, null = True)

    # Project Info
    project_request_created = models.DateTimeField(auto_now_add=True)
    project_name = models.CharField(max_length=100, null=True)
    project_description = models.TextField(null=True)
    project_identifier = models.CharField(max_length=50, null=True)
    project_website = models.CharField(max_length=100, null=True, blank=True)
    project_visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, null=True)

    # Project Resources x86
    project_resource_x86 = models.BooleanField(default=False)
    project_resource_x86_xlarge = models.CharField(max_length=50, null=True)
    project_resource_x86_large = models.CharField(max_length=50, null=True)
    project_resource_x86_small = models.CharField(max_length=50, null=True)
    project_resource_x86_xsmall = models.CharField(max_length=50, null=True)

    # Project Resources ARM
    project_resource_arm = models.BooleanField(default=False)
    project_resource_arm_large = models.CharField(max_length=50, null=True)
    project_resource_arm_small = models.CharField(max_length=50, null=True)

    # Admin
    project_id = models.IntegerField(null=True)
    current_project_status = models.CharField(max_length=20, choices=PROJECT_CURRENT_STATUS_CHOICES, default='Activated')
    project_request_subject = models.CharField(max_length=20, choices=PROJECT_REQUEST_TYPE_CHOICES, default='Creation')
    project_admin_response = models.TextField(blank=True, default='')
    project_acceptance = models.CharField(max_length=10, choices=PROJECT_ACCEPTANCE_CHOICES, default='Idle')

    class Meta:
        ordering = ['project_request_created']

class Project(models.Model):

    created = models.DateTimeField(auto_now_add=True)
    project_name = models.CharField(max_length=100)
    kube_config = models.CharField(max_length=99999)
    project_request = models.ForeignKey(ProjectRequest, related_name='project_request', on_delete=models.CASCADE)
    namespace_name = models.CharField(max_length=100)
    forward_pid = models.IntegerField(default=-1)
    cou_id = models.IntegerField(null=True)
    is_active = models.BooleanField(default=True)

    users = models.ManyToManyField(User, related_name='projects')

    class Meta:
        ordering = ['created']

    def delete_with_namespace(self):
        ns = self.namespace_name
        if self.forward_pid != -1:
            try:
                os.kill(self.forward_pid, signal.SIGKILL)
            except:
                pass

        cmd = f"/home/bruno/new-lab.sh delete {ns}"
        output_create_ns = subprocess.check_output(cmd, shell=True, universal_newlines=True)

        super(Project, self).delete()

    def create_k8s_namespace(self):
        ns = self.namespace_name

        cmd = f"/home/bruno/new-lab.sh apply {ns}"
        output_create_ns = subprocess.check_output(cmd, shell=True, universal_newlines=True)
        time.sleep(2)
        cmd_check_ready = f"kubectl get pods --kubeconfig={ROOT_KUBE_CONFIG_PATH} -n {ns} -o=jsonpath='{{range .items[*]}}{{.status.containerStatuses[0].ready}}{{\"\\n\"}}{{end}}'"
        output_check = subprocess.check_output(cmd_check_ready, shell=True, universal_newlines=True)
        while output_check.replace("\n", "") != 'true':
            time.sleep(1)
            output_check = subprocess.check_output(cmd_check_ready, shell=True, universal_newlines=True)

    def create_knetlab_operator_viewer(self):
        ns = self.namespace_name

        cmd = f"kubectl get pods --kubeconfig={ROOT_KUBE_CONFIG_PATH} -n {ns} -o=jsonpath='{{range .items[*]}}{{.metadata.name}}{{\"\\n\"}}{{end}}' | grep operator"
        operator_pod_name = subprocess.check_output(cmd, shell=True, universal_newlines=True).replace("\n","")

        cmd = f"kubectl cp -n {ns} /home/bruno/topology.js {operator_pod_name}:/app/resources/META-INF/resources/app/topology.js"
        topology_update_log = subprocess.check_output(cmd, shell=True, universal_newlines=True)

        port_id = 9000+self.id
        cmd_fwd = f"kubectl port-forward --address 0.0.0.0 --kubeconfig={ROOT_KUBE_CONFIG_PATH} {operator_pod_name} {port_id}:8080 -n {ns}"
        fwd_output=subprocess.Popen(cmd_fwd.split(" "))

        self.forward_pid = fwd_output.pid
        self.save()


def user_directory_path(instance, filename):
    dt_string = time.time()

    exp_parent = instance.experiments.first() # The first experiment is the parent (others are forks)
    return 'uploads/user_{0}/{1}_{2}.{3}.yaml'.format(
        exp_parent.user.id,
        dt_string,
        exp_parent.exp_name,
        instance.versionNumber
        )

class ExperimentFile(models.Model):
    id = models.AutoField(primary_key=True)
    experiment_yaml_file = models.FileField(blank=False, default="", upload_to=user_directory_path)
    versionNumber = models.IntegerField(default=1)

    # Experiment can have several experiment files and Experiment file can have several experiments
    experiments = models.ManyToManyField('Experiment', related_name='experimentfiles')


    def experiment_yaml_file_display(self):
        path_to_file = str(self.experiment_yaml_file)

        if not self.experiment_yaml_file or not os.path.exists(path_to_file):
            return None

        try:
            with open(path_to_file, 'r') as file:
                # data = file.read().replace('\n', '')
                data = file.read()
        except:
            return None

        return data
class Experiment(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    exp_name = models.CharField(max_length=100)
    # yaml_description = models.CharField(max_length=99999)

    user = models.ForeignKey(User, related_name='experiments', on_delete=models.SET_NULL, null=True)
    project = models.ForeignKey(Project, related_name='experiments', on_delete=models.CASCADE)

    # One experiment can be forked and have several children
    parent = models.ForeignKey('self', related_name='children', on_delete=models.SET_NULL, null=True)

    def validate_yaml(yaml, namespace, user):
        kc = ROOT_KUBE_CONFIG_PATH
        for clustername, cluster in ALTERNATIVE_CLUSTERS.items():
            if user and user.email in cluster['emails']:
                kc = cluster['kubeconfig_path']
                break

        return MentoredExperimentValidator(
            # schema_data=settings.EXPERIMENT_SCHEMA,
            namespace=namespace,
            kubeconfig_path=kc).validate(yaml)

    @property
    def lastVersionNumber(self):
        return self.experimentfiles.last().versionNumber

    @property
    def experiment_yaml_file(self):

        # Previously the system does not support multiple versions
        if self.experimentfiles.count() == 0:
            regex_old_file_path = f"uploads/user_{self.user.id}/*_{self.exp_name}.yaml"
            print(regex_old_file_path)
            old_file_path = glob.glob(regex_old_file_path)
            print(old_file_path)
            if len(old_file_path) > 0:
                new_fileexperiment = ExperimentFile.objects.create(
                    experiment_yaml_file=old_file_path[0], versionNumber=1)
                new_fileexperiment.save()
                new_fileexperiment.experiments.add(self)
                self.save()

        # Get the last version
        if self.experimentfiles.count() == 0:
            return None
        return self.experimentfiles.last().experiment_yaml_file

    @experiment_yaml_file.setter
    def experiment_yaml_file(self, value):
        if self._state.adding:
            return

        kc = ROOT_KUBE_CONFIG_PATH
        # if self.user and self.user.email in IOT_USERS:
        #     kc = IOT_KUBECONFIG_PATH
        for clustername, cluster in ALTERNATIVE_CLUSTERS.items():
            if self.user and self.user.email in cluster['emails']:
                kc = cluster['kubeconfig_path']
                break

        # Create a new version
        if self.experimentfiles.count() == 0:
            new_version = 1
        else:
            new_version = self.experimentfiles.last().versionNumber + 1

        new_file = ExperimentFile.objects.create(versionNumber=new_version)
        new_file.save()
        self.experimentfiles.add(new_file)
        self.save()
        new_file.experiment_yaml_file=value
        new_file.save()
        self.save()

    def fork(self, user, project_id=None, exp_name=None):
        if project_id is None:
            project = self.project
        else:
            project = Project.objects.get(pk=project_id)

        if exp_name is None:
            exp_name = self.exp_name

        experiment_files = self.experimentfiles.all()
        last_experiment_file = experiment_files.last()

        new_exp = Experiment.objects.create(
            exp_name=exp_name,
            user=user,
            project=project,
            parent=self
        )
        new_exp.save()

        # Add last_experiment_file to the new_exp as the first version
        new_exp.experimentfiles.add(last_experiment_file)
        new_exp.save()

        return new_exp

    def experiment_yaml_file_display(self):
        # Get the last version
        if self.experimentfiles.count() == 0:
            return None
        return self.experimentfiles.last().experiment_yaml_file_display()

    def get_all_versions_display(self):
        return [
            {
                "version": exp.versionNumber,
                "yaml": exp.experiment_yaml_file_display()
            }
            for exp in self.experimentfiles.all()
            # if exp.experiments.count() > 0 is not None
        ]

    class Meta:
        ordering = ['created']

def run_thread(instance, yaml_path, experiment_execution, user_name, exp_id, kubeconfig_path):
    yaml_path = str(yaml_path)

    me = MentoredExperiment(instance.project.namespace_name,
                            user_name=user_name,
                            exp_id=exp_id,
                            host_data_path=settings.EXPERIMENT_DATA_PATH,
                            kubeconfig_path=kubeconfig_path)

    print("New experiment on namespace: ", instance.project.namespace_name)

    try:
        instance.init()
        instance.start_warmup(yaml_path, me)
        instance.stop_warmup()
        instance.stop(yaml_path, me=me)
    except Exception as err:
        instance.onError(err)
        return

class ExperimentExecution(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField(auto_now_add=False, null=True)
    experiment = models.ForeignKey(Experiment, related_name='experiment', on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name='project', on_delete=models.CASCADE)
    status = models.IntegerField(default=0)
    execution_time = models.IntegerField(default=60)
    user = models.ForeignKey(User, related_name='experimentexecutions', on_delete=models.SET_NULL, null=True)
    project = models.ForeignKey(Project, related_name='experimentexecutions', on_delete=models.CASCADE)
    class Meta:
        ordering = ['created']

    # Custom field that computes the progress considering execution time, created and the current time
    @property
    def progress(self):
        s = self.start_time
        if s is None:
            return 0

        time_diff = time.time() - self.start_time.timestamp()

        warmup_ratio = 10.0
        running_ratio = 80.0
        stop_ratio = 10.0

        # TODO: Obtain the warmup and stop progress from MENTORED API
        running = min((time_diff/self.execution_time)*running_ratio, running_ratio)
        warmup = warmup_ratio if self.status >= 3 else 0
        stop = stop_ratio if self.status >= 4 else 0

        # Round up
        return int(math.ceil(running + warmup + stop))

    @property
    def experiment_data_size(self):
        exp_file_path = self.get_experiment_data()
        if exp_file_path is None:
            return 0
        if not os.path.exists(exp_file_path):
            return 0
        return os.path.getsize(exp_file_path)

    def get_experiment_data(self):
        kc = ROOT_KUBE_CONFIG_PATH
        # if self.user and self.user.email in IOT_USERS:
        #     kc = IOT_KUBECONFIG_PATH
        for clustername, cluster in ALTERNATIVE_CLUSTERS.items():
            if self.user and self.user.email in cluster['emails']:
                kc = cluster['kubeconfig_path']
                break

        me = MentoredExperiment(self.project.namespace_name,
                                user_name=self.user.pk,
                                exp_id=self.id,
                                host_data_path=settings.EXPERIMENT_DATA_PATH,
                                kubeconfig_path=kc)
        return me.get_experiment_data()

    def run(self):
        def f(yaml_path, experiment_execution, user_name, exp_id, kubeconfig_path):
            yaml_path = str(yaml_path)

            me = MentoredExperiment(self.project.namespace_name,
                                    user_name=user_name,
                                    exp_id=exp_id,
                                    host_data_path=settings.EXPERIMENT_DATA_PATH,
                                    kubeconfig_path=kubeconfig_path)
            print("New experiment on namespace: ", self.project.namespace_name)
            try:
                self.init()
                self.start_warmup(yaml_path, me)
                self.stop_warmup()
                self.stop(yaml_path, me=me)
            except Exception as err:
                self.onError(err)
                return
        kc = ROOT_KUBE_CONFIG_PATH
        # if self.user and self.user.email in IOT_USERS:
        #     kc = IOT_KUBECONFIG_PATH
        for clustername, cluster in ALTERNATIVE_CLUSTERS.items():
            if self.user and self.user.email in cluster['emails']:
                kc = cluster['kubeconfig_path']
                break

        print("Starting experiment")
        p = Process(target=f, args=(self.experiment.experiment_yaml_file, self, self.user.pk, self.id, kc))
        print("Starting process")
        p.start()
        # Get the stdout and stderr of the process and save it to the database every 5 seconds

    def init(self):
        print("Initializing experiment")
        self.status=1
        self.save()

    # TODO: Implement Warmup call in MentoredExperiment
    def start_warmup(self, yaml_path, me):
        print("Starting warmup")
        me.from_yaml(yaml_path)

        self.status=2
        self.save()

    def stop_warmup(self):
        print("Stoping warmup")
        self.status=3
        # Save as string
        self.start_time = timezone.now()
        self.save()
        time.sleep(self.execution_time)

    def stop(self, yaml_path, me=None):
        print("Stoping experiment")
        kc = ROOT_KUBE_CONFIG_PATH
        # if self.user and self.user.email in IOT_USERS:
        #     kc = IOT_KUBECONFIG_PATH
        for clustername, cluster in ALTERNATIVE_CLUSTERS.items():
            if self.user and self.user.email in cluster['emails']:
                kc = cluster['kubeconfig_path']
                break

        if me is None:
            me = MentoredExperiment(self.project.namespace_name,
                                    user_name=self.user.pk,
                                    exp_id=self.id,
                                    host_data_path=settings.EXPERIMENT_DATA_PATH,
                                    kubeconfig_path=kc)

        me.delete_kube_resources("mentored-{}-{}".format(
            self.id, self.user.pk), wait_for_create=False)

        self.status=4
        self.save()

    def get_running_pods(self):
        kc = ROOT_KUBE_CONFIG_PATH
        # if self.user and self.user.email in IOT_USERS:
        #     kc = IOT_KUBECONFIG_PATH
        for clustername, cluster in ALTERNATIVE_CLUSTERS.items():
            if self.user and self.user.email in cluster['emails']:
                kc = cluster['kubeconfig_path']
                break

        me = MentoredExperiment(self.project.namespace_name,
                                user_name=self.user.pk,
                                exp_id=self.id,
                                host_data_path=settings.EXPERIMENT_DATA_PATH,
                                kubeconfig_path=kc)

        return me.get_experiment_running_pods(
            "mentored-{}-{}".format(self.id, self.user.pk))

    def onError(self, err):
        print(err)

        # Create /app/errors if not exist
        if not os.path.exists("/app/errors"):
            os.mkdir("/app/errors")

        # Write error to file
        with open(f"/app/errors/{self.id}.txt", "w") as file:
            file.write(str(err))

        self.status=-1
        self.save()

    def delete(self):
        if self.status == 3:
            self.stop(yaml_path=self.experiment.experiment_yaml_file, me=None)

        super(ExperimentExecution, self).delete()