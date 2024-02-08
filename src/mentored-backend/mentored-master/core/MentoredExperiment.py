from MentoredComponent import MentoredComponent

from kubernetes import client, config, watch
import kubernetes

import json

import kubernetes.client

import yaml

import os

import time

import warnings

from MentoredDeviceSoftware import MentoredDeviceSoftware
from MentoredNetworking import MentoredNetworkingKubectl
from MentoredVolume import MentoredVolume

import argparse

from kubernetes.stream import stream

import itertools

from collections import defaultdict

class MentoredDataService():
  def __init__(self):
    pass
  
  def get_device_software(self, name_id):
    database = {
      'meu_device_software1': [
        {
          "name": "meu-device-software1",
          # "image": 'python:3.6.15-buster',
          "image": 'ghcr.io/brunomeyer/generic-botnet',
          "command": ["tail", "-f", "/dev/null"],
          "imagePullPolicy": "IfNotPresent",
          "stdin": True,
          "tty": True,
          "securityContext": {
            "privileged": True,
            "capabilities": {
              "add": [
                "NET_ADMIN"
              ]
            }
          },
        }
      ],

      'meu_device_software2': [
        {
          "name": "meu-device-software2",
          # "image": 'python:3.6.15-buster',
          "image": 'ghcr.io/brunomeyer/generic-botnet',
          "command": ["tail", "-f", "/dev/null"],
          "imagePullPolicy": "IfNotPresent",
          "stdin": True,
          "tty": True,
          "securityContext": {
            "privileged": True,
            "capabilities": {
              "add": [
                "NET_ADMIN"
              ]
            }
          },
        }
      ],
    }

    if name_id in database:
      return database[name_id]
    else:
      return None

class MentoredExperiment(MentoredComponent):
  def __init__(self,
               namespace,
               kubeconfig_path='/root/.kube/config',
               fname=None,
               user_name='bruno',
               exp_id=0,
               host_data_path="./persistent-data"):
    super().__init__(namespace)
    
    self.name = None
    self.timeout_warmup = None
    self.timeout_experiment = None
    self.containers_set = None
    self.nodeactors = None
    self.topology = None

    self.default_timeout_warmup = 10
    self.default_timeout_experiment = 60
    self.default_containers_set = []
    self.default_topology = 'fully_connected'
    self.user_name = user_name
    self.exp_id = exp_id
    self.kubeconfig_path = kubeconfig_path
    self.host_data_path = host_data_path
    
  def from_yaml(self, fname):
    with open(fname, "r") as stream:
      try:
          data = yaml.safe_load(stream)
          data = data['Experiment']
      except yaml.YAMLError as exc:
          print(exc)
    
    service = MentoredDataService()

    self.name = data['name']

    if 'timeout_warmup' in data:
      self.timeout_warmup = data['timeout_warmup']
    else:
      self.timeout_warmup = self.default_timeout_warmup

    if 'timeout_experiment' in data:
      self.timeout_experiment = data['timeout_experiment']
    else:
      self.timeout_experiment = self.default_timeout_experiment
      
    if 'containers_set' in data:
      self.containers_set = data['containers_set']

      # TODO: Store Device Softwares in database

    else:
      self.containers_set = self.default_containers_set

    self.nodeactors = data['nodeactors']

    for na in self.nodeactors:
      cs = na['containers'] # Containers set (device software)

      if type(cs) == str:
        db_cs = service.get_device_software(cs)
        if db_cs is None:
          raise Exception(f'Device Software "{cs}" not found in Database')
        na['containers'] = db_cs
      elif type(cs) == dict:
        pass
      elif type(cs) == list:
        pass
      else:
        raise Exception('Invalid containers_set element.'
                        f'Only dict or str is valid:\n {cs}')
    
    if 'topology' in data:
      self.topology = data['topology']
    else:
      self.topology = self.default_topology
    
    default_persitent_volume_path = None
    if 'default_persitent_volume_path' in data:
      default_persitent_volume_path = data['default_persitent_volume_path']

    # TODO: Implement full validation

    print(self.name)
    print(self.timeout_warmup)
    print(self.timeout_experiment)
    print(self.containers_set)
    print(self.nodeactors)
    print(self.topology)


    # mn = MentoredNetworking(self.namespace)
    mn = MentoredNetworkingKubectl(self.namespace, kubeconfig_path=self.kubeconfig_path)

    mn.next_networking_id = self.exp_id

    mv = MentoredVolume(self.namespace, self.host_data_path, self.exp_id, default_persitent_volume_path=default_persitent_volume_path)

    exp_result = mn.create_kube_resources(self.user_name, self.nodeactors, exp_id=self.exp_id, wait_for_run=True, network_type=self.topology, mentored_volume=mv)
    print(exp_result)
    
    # pods = mn.get_kube_resources(return_pods=True,
    #                              net_name=mn.net_name)
    # for pod_name in pods:
    #   mn.create_file_in_pod(pods[pod_name].metadata.name,
    #                         ['test1.txt', 'test2.txt'],
    #                         ['test\n\n1\n', 'test2\n\n1\n'])

  # def send_ip_files(self):
  #   mn = MentoredNetworking(self.namespace)

  #   pods = mn.get_kube_resources(return_pods=True,
  #                                net_name='mentorednetworking0-bruno-mentored')
  #   for pod_name in pods:
  #     print(pods[pod_name].metadata.name)
  #     mn.create_file_in_pod(pods[pod_name].metadata.name,
  #                           ['test1.txt', 'test2.txt'],
  #                           ['test\n\n1\n', 'test2\n\n1\n'])

  def delete_kube_resources(self, networking_name, wait_for_create=False):
    mv = MentoredVolume(self.namespace, self.host_data_path, self.exp_id)
    mn = MentoredNetworkingKubectl(self.namespace, kubeconfig_path=self.kubeconfig_path)
    print(mn.delete_kube_resources(networking_name, wait_for_create=False, mentored_volume=mv), end="\n\n")

  def get_experiment_data(self):
    mv = MentoredVolume(self.namespace, self.host_data_path, self.exp_id)
    return mv.get_experiment_data()

if __name__ == "__main__":

  # namespace = "mentored-lab"
  # namespace = "mentored-lab01"
  # namespace = "mentored-lab02"
  # namespace = "mentored-lab03"
  # namespace = "mentored-lab05"
  # namespace = "mentored-lab06"
  # namespace = "mentored-lab07"
  # namespace = "mentored-lab10"
  # namespace = "infect-4"
  default_namespace = "sbrc3"

  parser = argparse.ArgumentParser(description='Process some integers.')
  parser.add_argument('-f', '--input_file', dest='input_file', required=True)
  parser.add_argument('-c', dest='create', action='store_true')
  parser.add_argument('-l', dest='list', action='store_true')
  parser.add_argument('-d', dest='delete', action='store_true')
  parser.add_argument('-n', dest='namespace')
  parser.add_argument('-t', dest='target', default='')
  parser.add_argument('-e', dest='experiment_id', default=0, type=int)

  parser.set_defaults(create=False)
  parser.set_defaults(list=False)
  parser.set_defaults(delete=False)
  parser.set_defaults(namespace=default_namespace)

  args = parser.parse_args()
  namespace = args.namespace
  target = args.target

  exp_username = "test-dev"
  experiment_id = args.experiment_id
  
  target = "mentorednetworking{}-{}".format(experiment_id, exp_username)

  

  me = MentoredExperiment(namespace, kubeconfig_path="/home/bhmeyer/.kube/config", user_name=exp_username, exp_id=experiment_id)
  mn = MentoredNetworkingKubectl(namespace, kubeconfig_path="/home/bhmeyer/.kube/config")

  start_time = time.time()
  

  if args.create:
    # me.from_yaml('experiment_example_simple.yml')
    me.from_yaml(args.input_file)
  if args.list:
    print(json.dumps(mn.get_kube_resources(), indent=4, sort_keys=True), end="\n\n")
  if args.delete:
    # me.delete_kube_resources("mentorednetworking15-admin-mentored", wait_for_create=False)
    me.delete_kube_resources(target, wait_for_create=False)
