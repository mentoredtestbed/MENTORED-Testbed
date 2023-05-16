from django.db import models
from pygments.lexers import get_all_lexers
from pygments.styles import get_all_styles

from multiprocessing import Process
import tempfile
import yaml

import sys, os
sys.path.append('mentored-master/core/')
from MentoredExperiment import MentoredExperiment

import time

import subprocess
import signal

# from datetime import datetime

from django.contrib.auth.models import User # new


import threading
# import uwsgidecorators
from uwsgidecorators import *




LEXERS = [item for item in get_all_lexers() if item[1]]
LANGUAGE_CHOICES = sorted([(item[1][0], item[0]) for item in LEXERS])
STYLE_CHOICES = sorted([(item, item) for item in get_all_styles()])

class ProjectRequest(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    request_text = models.TextField()
    project_name = models.CharField(max_length=100)
    accepted = models.BooleanField(default=False)

    class Meta:
        ordering = ['created']

class Project(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    project_name = models.CharField(max_length=100)
    kube_config = models.CharField(max_length=99999)
    project_request = models.ForeignKey(ProjectRequest, related_name='project_request', on_delete=models.CASCADE)
    namespace_name = models.CharField(max_length=100)
    forward_pid = models.IntegerField(default=-1)

    class Meta:
        ordering = ['created']
    
    def delete(self):
        ns = self.namespace_name
        if self.forward_pid != -1:
            try:
                os.kill(self.forward_pid, signal.SIGKILL)
            except:
                pass
            
        cmd = f"/root/new-lab.sh delete {ns}"
        output_create_ns = subprocess.check_output(cmd, shell=True, universal_newlines=True)

        super(Project, self).delete()

    def create_k8s_namespace(self):
        ns = self.namespace_name
        
        cmd = f"/root/new-lab.sh apply {ns}"
        output_create_ns = subprocess.check_output(cmd, shell=True, universal_newlines=True)
        time.sleep(2)
        cmd_check_ready = f"kubectl get pods --kubeconfig=/root/.kube/config -n {ns} -o=jsonpath='{{range .items[*]}}{{.status.containerStatuses[0].ready}}{{\"\\n\"}}{{end}}'"
        output_check = subprocess.check_output(cmd_check_ready, shell=True, universal_newlines=True)
        while output_check.replace("\n", "") != 'true':
            time.sleep(1)
            output_check = subprocess.check_output(cmd_check_ready, shell=True, universal_newlines=True)

    def create_knetlab_operator_viewer(self):
        ns = self.namespace_name

        # cmd = f"kubectl get pods -n {ns} -o=jsonpath='{{range .items[*]}}{{.metadata.name}}{{\"\\n\"}}{{end}} --kubeconfig=/root/.kube/config' | grep operator"
        cmd = f"kubectl get pods --kubeconfig=/root/.kube/config -n {ns} -o=jsonpath='{{range .items[*]}}{{.metadata.name}}{{\"\\n\"}}{{end}}' | grep operator"
        # print(cmd)
        operator_pod_name = subprocess.check_output(cmd, shell=True, universal_newlines=True).replace("\n","")
        
        # cmd = f"kubectl get pods -n {ns} -o=jsonpath='{{range .items[*]}}{{.metadata.name}}{{\"\\n\"}}{{end}} --kubeconfig=/root/.kube/config' | grep operator"
        cmd = f"kubectl cp -n {ns} /root/topology.js {operator_pod_name}:/app/resources/META-INF/resources/app/topology.js"
        # print(cmd)
        topology_update_log = subprocess.check_output(cmd, shell=True, universal_newlines=True)
        print(topology_update_log)
        
        port_id = 9000+self.id
        # port_id = 8080+project.id
        # port_id = 9000
        # cmd_fwd = f"time kubectl port-forward --address 0.0.0.0 --kubeconfig=/root/.kube/config {operator_pod_name} {port_id}:8080 -n {ns}"
        cmd_fwd = f"kubectl port-forward --address 0.0.0.0 --kubeconfig=/root/.kube/config {operator_pod_name} {port_id}:8080 -n {ns}"
        # print(cmd_fwd)
        fwd_output=subprocess.Popen(cmd_fwd.split(" "))
        # fwd_output = subprocess.check_output(cmd, shell=True, universal_newlines=True).replace("\n","")

        self.forward_pid = fwd_output.pid
        self.save()

        print(operator_pod_name)
        print(fwd_output)
            

def user_directory_path(instance, filename):
  
    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    # now = datetime.now()
    # dt_string = now.strftime("%d\/%m\/%Y %H:%M:%S")
    dt_string = time.time()
    # filename = os.path.abspath(filename)
    # return 'uploads/user_{0}/{1}_{2}'.format(instance.user.id, dt_string, filename)
    return 'uploads/user_{0}/{1}_{2}.yaml'.format(instance.user.id, dt_string, instance.exp_name)

class Experiment(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    exp_name = models.CharField(max_length=100)
    # yaml_description = models.CharField(max_length=99999)
    experiment_yaml_file = models.FileField(blank=False, default="", upload_to=user_directory_path)

    user = models.ForeignKey(User, related_name='user', on_delete=models.SET_NULL, null=True)

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
    
    class Meta:
        ordering = ['created']

@thread
def run_thread(instance, yaml_path, experiment_execution, user_name, exp_id):
    yaml_path = str(yaml_path)
    me = MentoredExperiment(instance.project.namespace_name, user_name=user_name, exp_id=exp_id)

    print("New experiment on namespace: ", instance.project.namespace_name)
    
    # jsonschema.validate()
    try:
        # experiment_execution.status=1
        # experiment_execution.save()

        # me.from_yaml(yaml_path)
        # experiment_execution.status=2
        # experiment_execution.save()

        # time.sleep(experiment_execution.execution_time)
        # experiment_execution.status=3
        # experiment_execution.save()

        # me.delete_kube_resources("mentorednetworking{}-{}-mentored".format(exp_id, user_name), wait_for_create=False)
        # experiment_execution.status=4
        # experiment_execution.save()
        
        instance.init()
        instance.start_warmup(yaml_path, me)
        instance.stop_warmup()
        instance.stop(yaml_path, me=me)
    except Exception as err:
        instance.onError(err)
        return


class ExperimentExecution(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    experiment = models.ForeignKey(Experiment, related_name='experiment', on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name='project', on_delete=models.CASCADE)
    status = models.IntegerField(default=0)
    execution_time = models.IntegerField(default=60)
    user_name = models.CharField(max_length=100)

    class Meta:
        ordering = ['created']

    def run(self):
        # def f(yaml_data, experiment_execution, user_name, exp_id):
        # @uwsgidecorators.postfork
        # @uwsgidecorators.thread
        # @thread
        def f(yaml_path, experiment_execution, user_name, exp_id):
            
            

            yaml_path = str(yaml_path)

            me = MentoredExperiment(self.project.namespace_name, user_name=user_name, exp_id=exp_id)
            print("New experiment on namespace: ", self.project.namespace_name)
            # jsonschema.validate()
            try:
                # experiment_execution.status=1
                # experiment_execution.save()

                # me.from_yaml(yaml_path)
                # experiment_execution.status=2
                # experiment_execution.save()

                # time.sleep(experiment_execution.execution_time)
                # experiment_execution.status=3
                # experiment_execution.save()

                # me.delete_kube_resources("mentorednetworking{}-{}-mentored".format(exp_id, user_name), wait_for_create=False)
                # experiment_execution.status=4
                # experiment_execution.save()
                
                self.init()
                self.start_warmup(yaml_path, me)
                self.stop_warmup()
                self.stop(yaml_path, me=me)
            except Exception as err:
                self.onError(err)
                return
            
            '''
            with tempfile.NamedTemporaryFile(mode="w") as temp:
                temp.write(yaml_data)
                temp.flush()
                # yaml_path = '/root/mentored-backend/mentored-master/core/experiment_example_simple.yml'
                yaml_path = temp.name

                me = MentoredExperiment(self.project.namespace_name, user_name=user_name, exp_id=exp_id)

                # jsonschema.validate()
                try:
                    # experiment_execution.status=1
                    # experiment_execution.save()

                    # me.from_yaml(yaml_path)
                    # experiment_execution.status=2
                    # experiment_execution.save()

                    # time.sleep(experiment_execution.execution_time)
                    # experiment_execution.status=3
                    # experiment_execution.save()

                    # me.delete_kube_resources("mentorednetworking{}-{}-mentored".format(exp_id, user_name), wait_for_create=False)
                    # experiment_execution.status=4
                    # experiment_execution.save()
                    
                    self.init()
                    self.start_warmup(yaml_path, me)
                    self.stop_warmup()
                    self.stop(me)


                except Exception as err:
                    self.onError(err)
                    return
            '''

        # p = Process(target=f, args=(self.experiment.experiment_yaml_file, self, self.user_name, self.id))
        # p.start()
        run_thread(self, self.experiment.experiment_yaml_file, self, self.user_name, self.id)
        # p.join()
    
    def init(self):
        self.status=1
        self.save()
    
    def start_warmup(self, yaml_path, me):
        me.from_yaml(yaml_path)


        # cmd_apply = f"kubectl apply -f {yaml_path} --kubeconfig=/root/.kube/config -n mentored"
        # output_check = subprocess.check_output(cmd_apply, shell=True, universal_newlines=True)
        # while output_check.replace("\n", "") != 'true':
        #     time.sleep(1)
        #     output_check = subprocess.check_output(cmd_check_ready, shell=True, universal_newlines=True)

        self.status=2
        self.save()
    
    def stop_warmup(self):
        self.status=3
        self.save()
        time.sleep(self.execution_time)
    
    def stop(self, yaml_path, me=None):
        if me is None:
            me = MentoredExperiment(self.project.namespace_name, user_name=self.user_name, exp_id=self.id)
        
        me.delete_kube_resources("mentorednetworking{}-{}-mentored".format(self.id, self.user_name), wait_for_create=False)
        
        # cmd_apply = f"kubectl delete -f {yaml_path} --kubeconfig=/root/.kube/config -n mentored"
        # output_check = subprocess.check_output(cmd_apply, shell=True, universal_newlines=True)
        
        self.status=4
        self.save()
    
    def onError(self, err):
        print(err)
        self.status=-1
        self.save()

    def delete(self):
        # files = WidgetFile.objects.filter(widget=self)
        # if files:
        #     for file in files:
        #         file.delete()
        # super(Widget, self).delete()

        if self.status == 3:
            self.stop()
        
        super(ExperimentExecution, self).delete()



