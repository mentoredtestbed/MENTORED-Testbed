from MentoredComponent import MentoredComponent

from kubernetes import client, config, watch
import kubernetes

import json

import kubernetes.client

import yaml

import os

import time

import warnings

from MentoredDeviceSoftware import MentoredDeviceSoftwareKnetlab, MentoredDeviceSoftwareKubectl
from MentoredVolume import MentoredVolume
from MentoredDataService import MentoredDataService

import argparse

from kubernetes.stream import stream

import itertools

from collections import defaultdict

import tarfile
from tempfile import TemporaryFile
from tempfile import NamedTemporaryFile

import numpy as np


class NodeActor():
  def __init__(
    self,
    username,
    namespace,
    net_name,
    name,
    size=1,
    containers=None,
    region=None,
    cluster=None,
    mode='kubectl',
    persitent_volume_path=None,
    start_on_create=True,
    kubeconfig_path='/root/.kube/config'):

    # self.namespace = "mentored-lab01"
    self.username = username
    self.namespace = namespace
    self.net_name = net_name
    self.name = name
    self.containers = containers
    self.persitent_volume_path = persitent_volume_path

    print("Creating NodeActor:")
    print("\tpersitent_volume_path: {}".format(persitent_volume_path))

    if containers is None:
      #TODO : Update address
      self.containers = [
        {
          "name": "alpine",
          "image": 'alpine',
          "imagePullPolicy": "IfNotPresent",
          "env": [],
          "stdin": True,
          "tty": True,
          "securityContext": {
            "privileged": True,
            "capabilities": {
              "add": [
                "NET_ADMIN"
              ]
            }
          }
        }
      ]

    if region is None:
      self.region = self.select_best_region()
    else:
      self.region = region
    
    if cluster is None:
      # TODO: Implement cluster selection
      self.cluster = "default"
    else:
      self.cluster = cluster

    self.mode = mode
    self.size = size
    self.start_on_create = start_on_create

    self.instantiated_pods = np.zeros(size).astype(bool)

    self.knetlab_devices = []
    self.knetlab_devices_names = []

    if mode == 'knetlab':
      self.mdvs = MentoredDeviceSoftwareKnetlab(namespace)
      self.create_knetlab_devices()
    if mode == 'kubectl':
      self.mdvs = MentoredDeviceSoftwareKubectl(
        namespace,
        persitent_volume_path=self.persitent_volume_path,
        kubeconfig_path=kubeconfig_path)
      self.create_kubectl_devices()
      if start_on_create:
        self.start_kubectl_devices()

  def __len__(self):
    return self.size

  def create_knetlab_devices(self):
    for i in range(self.size):
      d_name = "{}-{}-{}".format(self.net_name, self.name, i)
      device = self.mdvs.create_kube_resources(self.username,
                           self.containers,
                           d_name=d_name)
      self.knetlab_devices.append(device)
      self.knetlab_devices_names.append(d_name)

  def get_total_instantiated(self):
    return np.sum(self.instantiated_pods)

  def is_all_instantiated(self):
    return np.sum(self.instantiated_pods) == self.size

  def create_kubectl_devices(self, total=None):
    total = total if total is not None else self.size
    total_instances = 0
    i = 0

    ret_val = []
    while (i < self.size) or (total_instances < total):
      if self.instantiated_pods[i]:
        i += 1
        continue

      d_name = "{}-{}-{}".format(self.net_name, self.name, i)

      self.knetlab_devices_names.append(d_name)
      i += 1
      total_instances += 1
      ret_val.append(d_name)

    return ret_val

  def start_kubectl_devices(self, total=None):
    total = total if total is not None else self.size
    total_instances = 0
    i = 0

    ret_val = []
    while (i < self.size) and (total_instances < total):
      if self.instantiated_pods[i]:
        i += 1
        continue

      # d_name = "{}-{}-{}".format(self.net_name, self.name, i)
      context_name = f"{self.net_name}-{self.name}"
      d_name = f"{context_name}-{i}"

      device = self.mdvs.create_kube_resources(self.username,
                           self.containers,
                           d_name=d_name,
                           device_features = {
                            "region": self.region,
                            "mentored_replica_id": str(i),
                            "mentored_na_name": self.name
                           },
                           cluster=self.cluster,
                           )

      self.knetlab_devices.append(device)
      self.instantiated_pods[i] = True

      i += 1
      total_instances += 1
      ret_val.append(d_name)

    return ret_val




  def delete_knetlab_devices(self):
    d_list = []
    for i in range(self.size):
      d_name = "mentored-{}-{}".format(self.name, i)
      device = self.mdvs.delete_kube_resources(d_name, wait_for_create=True)
      d_list.append(device)

    return d_list

  def delete_kubectl_devices(self):
    d_list = []
    for i in range(self.size):
      d_name = "mentored-{}-{}".format(self.name, i)
      device = self.mdvs.delete_kube_resources(d_name, wait_for_create=True)
      d_list.append(device)
    return d_list

  def select_best_region(self):
    pass



class MentoredNetworking(MentoredComponent):


  def __init__(self, namespace, kubeconfig_path='/root/.kube/config'):
    super().__init__(namespace)
    config.load_kube_config(kubeconfig_path)
    # self.kubeapi = client.CoreV1Api()

    self.configuration = config.load_kube_config(kubeconfig_path)

    with kubernetes.client.ApiClient(self.configuration) as api_client:
      # Create an instance of the API class
      self.kubeapi = kubernetes.client.CoreV1Api(api_client)
      self.apps_v1 = kubernetes.client.AppsV1Api(api_client)

    self.next_networking_id = 0

    configuration = config.load_kube_config(kubeconfig_path)

    with kubernetes.client.ApiClient(configuration) as api_client:
      self.api_instance = kubernetes.client.CustomObjectsApi(api_client)

    self.nodeActors = {}


  def pod_exec(self, pod, cmd, stdin=True, tty=True, container=None):
    if container is None:
      response = stream(self.kubeapi.connect_post_namespaced_pod_exec,
              pod,
              self.namespace,
              stderr=True,
              stdin=stdin,
              stdout=True,
              tty=tty,
              command=cmd.split(" "))
    else:
      response = stream(self.kubeapi.connect_post_namespaced_pod_exec,
                pod,
                self.namespace,
                stderr=True,
                stdin=stdin,
                stdout=True,
                tty=tty,
                container=container,
                command=cmd.split(" "))

    return response

  # TODO: Inject device label inside each pod
  def get_kube_resources(self, return_pods=True, net_name=None):

    if return_pods:
      pod_list = self.kubeapi.list_namespaced_pod(self.namespace)

      pod_dict = {
        x.metadata.labels['device']: x for x in pod_list.items
        if 'device' in x.metadata.labels.keys() and net_name in x.metadata.labels['device']
      }

      return pod_dict

    raise Exception("Resource not supported in get_kube_resources")

    return None


  def get_pod_ip_from_k8s(self, pod):
    '''
    net_interface attributes:
    - 'name'
    - 'ips'
    - 'default'
    - 'mac'
    - 'dns'
    '''
    if 'k8s.v1.cni.cncf.io/network-status' not in pod.metadata.annotations.keys():
      return None, None

    net_interface_list = json.loads(
      pod.metadata.annotations['k8s.v1.cni.cncf.io/network-status']
    )

    ip_list = {}
    default_ifname = None
    for i, net_interface in enumerate(net_interface_list):
      if 'default' in net_interface.keys() and net_interface['default']:
        default_ifname = 'eth0'
        if 'interface' in net_interface:
          default_ifname = net_interface['interface']
        ip_list[default_ifname] = net_interface['ips'][0]
      else:
        cni_name = f'undefined_ifname{i}'
        if 'interface' in net_interface:
          cni_name = net_interface['interface']
        if 'ips' in net_interface.keys():
          ip_list[cni_name] = net_interface['ips'][0]
        else:
          ip_list[cni_name] = None

    return default_ifname, ip_list

  def create_file_in_pod(self, pod_name, list_file_name, list_file_content,
                         verbose=0, container=None):
    print(f"Creating files in pod {pod_name} container: {container}")
    try:
      exec_command = ['tar', 'xvf', '-', '-C', '/']

      if container is None:
        resp = stream(self.kubeapi.connect_get_namespaced_pod_exec,
                      pod_name,
                      self.namespace,
                      command=exec_command,
                      stderr=True, stdin=True,
                      stdout=True, tty=False,
                      _preload_content=False)
      else:
        resp = stream(self.kubeapi.connect_get_namespaced_pod_exec,
                      pod_name,
                      self.namespace,
                      command=exec_command,
                      stderr=True, stdin=True,
                      stdout=True, tty=False,
                      container=container,
                      _preload_content=False)

      with TemporaryFile() as tar_buffer:

        with tarfile.open(fileobj=tar_buffer, mode='w') as tar:
          for file_content, file_name in zip(list_file_content, list_file_name):
            f = NamedTemporaryFile()
            f.seek(0)
            f.write(file_content.encode())
            f.flush()

            # Change the file name to something
            tar.add(f.name, arcname=file_name)
            f.close()

        tar_buffer.seek(0)
        commands = []
        commands.append(tar_buffer.read())

      while resp.is_open():
          resp.update(timeout=1)
          if verbose > 0 and resp.peek_stdout():
              print("STDOUT: %s" % resp.read_stdout())
          if verbose > 0 and resp.peek_stderr():
              print("STDERR: %s" % resp.read_stderr())
          if commands:
              c = commands.pop(0)
              # print("Running command... %s\n" % c)

              resp.write_stdin(c.decode())
          else:
              break
      resp.close()
    except Exception as e:
      print(f"Fail to create mentored files in pod {pod_name}")
      print(e)

  def create_kube_resources(self, username, raw_device_list, network_type='ovs_fully_connected', wait_for_run=False):
    raise Exception("Not implemented")

  def delete_kube_resources(self, net_name, wait_for_create=False):
    raise Exception("Not implemented")

class MentoredNetworkingKubectl(MentoredNetworking):
  def __init__(self, namespace, pod_start_per_time=5,  kubeconfig_path='/root/.kube/config'):
    super().__init__(namespace, kubeconfig_path)
    self.pod_start_per_time = pod_start_per_time
    self.kubeconfig_path = kubeconfig_path
    self.mdvs = MentoredDeviceSoftwareKubectl(namespace, kubeconfig_path=kubeconfig_path)
    self.node_actors_ips = None

  # def create_kube_resources(self, username, raw_device_list, network_type='ovs_fully_connected', wait_for_run=False):
  def create_kube_resources(self, username, raw_device_list, network_type="None", wait_for_run=False, mentored_volume=None, exp_id=None):

    network_types = ['ovs_fully_connected', 'fully_connected', 'test_topology', "None"]
    if not (network_type in network_types):
      if type(network_type) != list:
        raise "invalid network_type. Current network_types = {}".format(network_types)

    exp_id = exp_id if exp_id is not None else self.next_networking_id
    # TODO: Fix name generator
    net_name = "mentored-{}-{}".format(exp_id,
                             username)

    self.net_name = net_name

    # TODO: Validation of raw_device_list

    containers_count = sum(
      [len(x['containers'])*x['replicas'] for x in raw_device_list]
    )

    device_ifname_list = defaultdict(list, {})

    region_set = []

    device_list = []

    pod_list = []
    # The first container is the main container
    main_container = defaultdict(lambda: None)

    device_name_to_name_actor = {}
    for na_raw in raw_device_list:
      na_name = na_raw['name']

      size = na_raw['replicas']
      containers = na_raw['containers']
      region = na_raw['region']
      cluster = na_raw['cluster']

      persitent_volume_path = None
      if mentored_volume is not None:
        persitent_volume_path = mentored_volume.get_pv_path()

      persitent_volume_path = na_raw['persitent_volume_path'] if "persitent_volume_path" in na_raw else persitent_volume_path

      na = NodeActor(username,
                     self.namespace,
                     net_name,
                     na_name,
                     size=size,
                     containers=containers,
                     region=region,
                     cluster=cluster,
                     mode="kubectl",
                     persitent_volume_path=persitent_volume_path,
                     start_on_create=False,
                     kubeconfig_path=self.kubeconfig_path)

      self.nodeActors[na_name] = na

      if not region in region_set:
        region_set.append(region)

      for i in range(len(na)):
        device_list.append({
          'name': na.knetlab_devices_names[i],
          'type': 'host',
          'model': na.knetlab_devices_names[i],
          'region': region,
          'config': ''
        })

        device_name_to_name_actor[na.knetlab_devices_names[i]] = na_name

        main_container[na.knetlab_devices_names[i]] = containers[0]['name']

    if network_type == 'ovs_fully_connected':
      for region in region_set:
        ovs_name = 'ovs-{}'.format(region)
        # TODO: Add feature to monitor network traffic in each OVS
        na = NodeActor(username,
                     self.namespace,
                     net_name,
                     ovs_name,
                     size=1,
                     containers=MentoredDataService().get_device_software("ovs"),
                     region=region,
                     mode="kubectl",
                     persitent_volume_path="None",
                     start_on_create=True,
                     kubeconfig_path=self.kubeconfig_path)

        for i in range(len(na)):
          device_list.append({
            'name': na.knetlab_devices_names[i],
            'type': 'ovs',
            'model': na.knetlab_devices_names[i],
            'region': region,
            'config': ''
          })

    elif network_type == 'test_topology':
      ovs_name = '{}-ovs-ids-sc'.format(net_name)
      device_list.append({
        'name': ovs_name,
        'type': 'switch',
        'model': 'ovs',
        'region': 'ids-sc',
        'config': ''
      })

    # TODO: Option to use NETWORK SIMULATOR

    link_list = []

    # TODO: Ensure all ifname have <= 16 characters

    # All OVS will be conected in chain
    # The order is defined by the user, considering the same order that
    # regions appear in raw_device_list
    if network_type == 'ovs_fully_connected':
      ovs_device_list = [x for x in device_list if x['model'] == 'ovs']

      # Create all links between OVSs
      for i, dvc1 in enumerate(ovs_device_list[:-1]):
        dvc2 = ovs_device_list[i+1]
        j = i+1
        if dvc1 != dvc2:
          lname = '{}-{}'.format(dvc1['region'], dvc2['region'])
          rev_lname = '{}-{}'.format(dvc2['region'], dvc1['region'])

          link_list.append({
            'name': lname,
            'source':{
              'name': dvc1['name'],
              'ifname': lname
            },
            'destination':{
              'name': dvc2['name'],
              'ifname': rev_lname
            }
          })

          device_ifname_list[dvc1['name']].append(lname)
          device_ifname_list[dvc2['name']].append(rev_lname)


      host_device_list = [x for x in device_list if x['type'] == 'host']

      # Create all links between OVSs and the hosts inside its region
      for i, dvc_host in enumerate(host_device_list):
        region = dvc_host['region']
        ovs_name = '{}-ovs-{}'.format(net_name, region)

        lname = 'to-{}'.format(i)
        link_list.append({
          'name': lname,
          'source':{
            'name': dvc_host['name'],
            'ifname': 'ovs-link'.format(i)
          },
          'destination':{
            'name': ovs_name,
            'ifname': lname
          }
        })
        device_ifname_list[dvc_host['name']].append('ovs-link'.format(i))
        device_ifname_list[ovs_name].append(lname)
    elif network_type == 'fully_connected':
      for i, dvc1 in enumerate(device_list):
        for j,dvc2 in enumerate(device_list[i:]):
          if dvc1 != dvc2:
            lname = 'l{}-{}'.format(i, i+j)
            rev_lname = 'l{}-{}'.format(i+j, i)

            link_list.append({
              'name': lname,
              'source':{
                'name': dvc1['name'],
                'ifname': lname
              },
              'destination':{
                'name': dvc2['name'],
                'ifname': rev_lname
              }
            })

            device_ifname_list[dvc1['name']].append(lname)
            device_ifname_list[dvc2['name']].append(rev_lname)
    elif type(network_type) == list:
      for i, (na_name1, na_name2) in enumerate(network_type):
        j = 0
        for dvc1_name in self.nodeActors[na_name1].knetlab_devices_names:
          for dvc2_name in self.nodeActors[na_name2].knetlab_devices_names:
            lname = 'link{}'.format(i)
            ifname = 'link{}-{}'.format(i, j)
            rev_ifname = ifname

            link_list.append({
              'name': lname,
              'source':{
                'name': dvc1_name,
                'ifname': ifname
              },
              'destination':{
                'name': dvc2_name,
                'ifname': rev_ifname
              }
            })

            device_ifname_list[dvc1_name].append(ifname)
            device_ifname_list[dvc2_name].append(rev_ifname)
            j+=1

    elif network_type == 'test_topology':

      ovs_device_list = [x for x in device_list if x['model'] == 'ovs']
      for i, dvc1 in enumerate(ovs_device_list):
        for j,dvc2 in enumerate(device_list[i:]):
          if dvc1 != dvc2 and dvc2['type'] == 'host':
            lname = 'l{}-{}'.format(i, i+j)
            rev_lname = 'l{}-{}'.format(i+j, i)

            link_list.append({
              'name': lname,
              'source':{
                'name': dvc1['name'],
                'ifname': lname
              },
              'destination':{
                'name': dvc2['name'],
                'ifname': rev_lname
              }
            })

            device_ifname_list[dvc1['name']].append(lname)
            device_ifname_list[dvc2['name']].append(rev_lname)


    self.next_networking_id+=1

    # TODO: Add warmup phase in different methods

    # Wait for the schedule of all pods
    # device_list_names = set([x['name'] for x in device_list])
    # ovs_device_list = [x for x in device_list[:total_pods] if x['model'] == 'ovs']
    # Wait for the schedule of all pods
    device_list_names = set()

    while len(device_list_names) < len(device_list):
      # for total_pods in range(0, len(device_list), self.pod_start_per_time):
      for na_name in self.nodeActors:
        na = self.nodeActors[na_name]
        if na.is_all_instantiated():
          continue

        device_list_names = device_list_names.union(
          set(na.start_kubectl_devices(total=self.pod_start_per_time)))

        if not self.pod_start_per_time is None:
          break

      set_active_deployments = set()

      while len(device_list_names - set_active_deployments) > 0:
        deployments = self.get_kube_resources(return_pods=False, return_deployments=True, net_name=net_name)

        set_active_deployments = set(deployments.keys())
        print(f"set_active_deployments {set_active_deployments}")
        
        remaining = device_list_names - deployments.keys()
        print(f"{len(remaining)} Remaining: {remaining}")
        print("")
        time.sleep(1)


      warmup_finished = False
      # Wait for all pods change their status to 'Running'
      while not warmup_finished:
        pods = self.get_kube_resources(return_pods=True,
                                      net_name=net_name)

        waiting_status = []
        for x in pods:
          # Check the status of each container in the pod
          cstatus = pods[x].status.container_statuses
          # If the status is not available, then assumes that
          # it is not running
          if cstatus is None:
            waiting_status.append([True])
            continue

          wating_containers = []
          for y in cstatus:
            wating_containers.append(y.state.running is None)
          # print(f"Containers status:{wating_containers}")
          waiting_status.append(wating_containers)

        merged = list(itertools.chain(*waiting_status))

        # If at least 1 container/pod is not ready, the warmup will continue
        total_ready = len(merged) - sum(merged)
        warmup_finished = sum(merged) == 0
        print("Warmup phase... ({}/{} containers ready)".format(
          total_ready,
          containers_count))

        time.sleep(1)

    ovs_device_list_name = [x['name'] for x in device_list if x['model'] == 'ovs']
    host_device_list_name = [x['name'] for x in device_list if x['type'] == 'host']

    # TODO: Collect and report STOUT/STDERR of Containers execs 
    for pod in ovs_device_list_name:
      if 'device' in pods[pod].metadata.labels.keys():
        dvc_name = pods[pod].metadata.labels['device']
        pod_name = pods[pod].metadata.name
        if dvc_name in ovs_device_list_name:
          cmd = '/usr/bin/ovs-vsctl add-br br0'
          print('[Container exec] {}$ {}'.format(dvc_name, cmd))
          container = main_container[dvc_name]
          result_cmd = self.pod_exec(pod_name, cmd, container=container)

          for ifname in device_ifname_list[dvc_name]:
            cmd = '/usr/bin/ovs-vsctl add-port br0 {}'.format(ifname)
            print('[Container exec] {}$ {}'.format(dvc_name, cmd))

            container = main_container[dvc_name]
            result_cmd = self.pod_exec(pod_name, cmd, container=container)


    node_actors_ips = defaultdict(list, {})

    # IP Definition
    if network_type == "ovs_fully_connected":
      for i, pod in enumerate(host_device_list_name):
        if 'device' in pods[pod].metadata.labels.keys():
          default_ifname, kube_ip_list =self. get_pod_ip_from_k8s(pods[pod])
          if kube_ip_list is None:
            continue
          kube_ip = kube_ip_list[default_ifname]

          dvc_name = pods[pod].metadata.labels['device']
          pod_name = pods[pod].metadata.name


          na_name = device_name_to_name_actor[dvc_name]
          pod_ip_list = [
            [kube_ip, '32', default_ifname]
          ]
          for j, ifname in enumerate(device_ifname_list[dvc_name]):
            pod_ip = ['10.0.{}.{}'.format(j, i+2), '24', ifname]
            pod_ip_list.append(pod_ip)
            cmd = 'ip addr add {}/{} dev {}'.format(pod_ip[0],
                                                    pod_ip[1],
                                                    pod_ip[2])
            print('[Container exec] {}$ {}'.format(dvc_name, cmd))

            container = main_container[dvc_name]
            result_cmd = self.pod_exec(pod_name, cmd, container=container)

          node_actors_ips[na_name].append(pod_ip_list)

    elif network_type == "fully_connected" or type(network_type) == list:
      for i, link in enumerate(link_list):

        ifname1 = link['source']['ifname']
        ifname2 = link['destination']['ifname']

        dvc1_name = link['source']['name']
        dvc2_name = link['destination']['name']

        pod1_name = pods[dvc1_name].metadata.name
        pod2_name = pods[dvc2_name].metadata.name


        cmd = 'ip addr add 10.0.{}.2/24 dev {}'.format(i, ifname1)
        print('[Container exec] {}$ {}'.format(dvc1_name, cmd))
        container = main_container[dvc1_name]
        result_cmd = self.pod_exec(pod1_name, cmd, container=container)

        cmd = 'ip addr add 10.0.{}.3/24 dev {}'.format(i, ifname2)
        print('[Container exec] {}$ {}'.format(dvc2_name, cmd))
        container = main_container[dvc2_name]
        result_cmd = self.pod_exec(pod2_name, cmd, container=container)

    if network_type == "None":
      # Get the intersection of the list of pods and the list of host devices by checking the device label of each pod.
      # Needed because host_device_list_name no longer matches the name of the pods.
      host_device_pods = list(filter(lambda pod: pods[pod].metadata.labels['device'] in host_device_list_name, pods.keys()))
      for i, pod in enumerate(host_device_pods):
        # print(pods[pod].metadata.labels.keys())
        if 'device' in pods[pod].metadata.labels.keys():
          default_ifname, kube_ip_list = self.get_pod_ip_from_k8s(pods[pod])
          if kube_ip_list is None:
            continue
          # TODO: Add net1 in a config variable (it can change in future)
          default_ifname = 'net1' # This is the interface for macvlan

          if 'net1' not in kube_ip_list.keys():
            default_ifname = 'eth0'

          kube_ip = kube_ip_list[default_ifname]

          dvc_name = pods[pod].metadata.labels['device']
          pod_name = pods[pod].metadata.name


          na_name = device_name_to_name_actor[dvc_name]
          pod_ip_list = [
            [kube_ip, '32', default_ifname]
          ]

          node_actors_ips[na_name].append(pod_ip_list)

    self.node_actors_ips = node_actors_ips

    mentored_volume.save_text_as_file(json.dumps(node_actors_ips, indent=4, sort_keys=True),
                                      "MENTORED_IP_LIST.json",)
    mentored_volume.save_text_as_file(yaml.dump(json.loads(json.dumps(node_actors_ips))),
                                      "MENTORED_IP_LIST.yaml",)

    # Broadcast shared files
    deployments = self.get_kube_resources(return_pods=False, return_deployments=True,
                                   net_name=net_name)
    for deploys in deployments:

      json_data = json.dumps(node_actors_ips,
                             indent=4,
                             sort_keys=True)

      yaml_data = yaml.dump(json.loads(json_data))

      pod = self.mdvs.get_pods_from_deployment(deploys)[0]
      pod_name = pod.metadata.name
      for container in pod.spec.containers:
          container_name = container.name
          # print("Main container: {}".format(main_container))
          # print("Container: {}".format(container_name))
          # print("Pod name: {}".format(pod_name))
          self.create_file_in_pod(pods[pod_name].metadata.name,
                                  ['MENTORED_IP_LIST.json',
                                   'MENTORED_IP_LIST.yaml'],
                                  [json_data,
                                   yaml_data],
                                   container=container_name)

    # deployments = self.get_kube_resources(return_pods=False, return_deployments=True, net_name=net_name)
    deployments_sorted_by_age = sorted(deployments.values(), key=lambda x: x.metadata.creation_timestamp)

    schedule_time = int(time.time() + len(deployments_sorted_by_age))

    # Broadcast shared files
    for i, deploy in enumerate(deployments_sorted_by_age):
      pod = self.mdvs.get_pods_from_deployment(deploy.metadata.labels['device'])[0]
      pod_name = pod.metadata.name
      print(f"Broadcasting shared files to {pod_name} ({i+1}/{len(pods)})")
      
      # Wrap this in a for loop to create files in all containers
      for container in pod.spec.containers:
          container_name = container.name
          # print("Main container: {}".format(main_container))
          # print("Container: {}".format(container_name))
          self.create_file_in_pod(pods[pod_name].metadata.name,
                                  ['MENTORED_READY'],
                                  [str(schedule_time)],
                                  container=container_name)

    mentored_volume.save_text_as_file(str(schedule_time),
                                      "MENTORED_READY.txt")
    return None

  def get_kube_resources(self, return_pods=False, return_deployments=False, net_name=None):

    if return_pods:
      pod_list = self.kubeapi.list_namespaced_pod(self.namespace)
      pod_dict = {
        x.metadata.name: x for x in pod_list.items
        if net_name in x.metadata.name
      }

      return pod_dict
        
    if return_deployments:
      deployment_list = self.apps_v1.list_namespaced_deployment(self.namespace)

      deployment_dict = {
        x.metadata.labels['device']: x for x in deployment_list.items
        if 'device' in x.metadata.labels.keys() and net_name in x.metadata.labels['device']
      }
      return deployment_dict

    n_list = self.api_instance.list_namespaced_pod(namespace=self.namespace)

    networking_dict = {
      x["metadata"]["name"]: x for x in n_list["items"]
    }

    return networking_dict

  def get_kube_logs(self, net_name, mentored_volume):
    nodeActors_net = self.mdvs.get_kube_resources(include=net_name, return_pods=False)
    all_logs, all_fnames = [], []

    for na in list(nodeActors_net):
      total_containers = len(nodeActors_net[na].spec.template.spec.containers)
      for container in nodeActors_net[na].spec.template.spec.containers:
        cname = container.name
        print("Container name: {}".format(cname))
        mentored_replica_id = nodeActors_net[na].metadata.labels['mentored_replica_id']
        na_name = nodeActors_net[na].metadata.labels['mentored_na_name']

        # Run the equivalent to kubectl log container
        print("Saving log data from Device Software {}".format(na))
        podname = self.mdvs.get_pods_from_deployment(na)[0].metadata.name # TODO: If deployments have more than a pod, it will fail
        # print("NA: {}".format(na))
        # print("Pod name: {}".format(podname))
        logs = self.kubeapi.read_namespaced_pod_log(
          name=podname,
          namespace=self.namespace,
          container=cname,
          timestamps=True,
          pretty='true',
        )
        all_logs.append(logs)

        txt_name = f"{na_name}-{mentored_replica_id}"
        if total_containers > 1:
          all_fnames.append(txt_name+"_"+cname+".txt")
        else:
          all_fnames.append(txt_name+".txt")

    mentored_volume.save_files_in_pd(all_logs, all_fnames, mentored_volume.get_log_data(only_fname=True))


  def delete_kube_resources(self, net_name, wait_for_create=False, mentored_volume=None):
    if mentored_volume is not None:
      self.get_kube_logs(net_name, mentored_volume)

    nodeActors_net = self.mdvs.get_kube_resources(include=net_name, return_pods=False)

    max_pod_per_time = self.pod_start_per_time
    # max_pod_per_time = 100

    deleting_pods = []
    for i, na in enumerate(list(nodeActors_net)):
      pvp_list = json.loads(nodeActors_net[na].metadata.annotations["persitent_volume_path"])

      pvp_list = pvp_list if pvp_list else []

      if type(pvp_list) == str:
        pvp_list = [pvp_list]

      for pvp_idx, pvp in enumerate(pvp_list):
        container = nodeActors_net[na].spec.template.spec.containers[pvp_idx]
        na_name = nodeActors_net[na].metadata.labels['mentored_na_name']
        mentored_replica_id = nodeActors_net[na].metadata.labels['mentored_replica_id']
        tarname = f"{na_name}-{mentored_replica_id}"
        cname = container.name

        if (pvp is not None) and (mentored_volume is not None):
          if pvp != "None":
            print("Saving Persistent data from Device Software {} (container {}): {}".format(na, cname, pvp))
            podname = self.mdvs.get_pods_from_deployment(na)[0].metadata.name # TODO: If deployments have more than a pod, it will fail
            mentored_volume.save_pod_data(podname, pvp, container=cname, prefix=na_name, tarname=tarname)

      print("Deleting Device Software: {}.  Progress: {}/{}".format(na, i+1, len(nodeActors_net)))
      self.mdvs.delete_kube_resources(na, wait_for_create=True)

      deleting_pods.append(na)

      # Wait for the deletion of pods if the number of pods is greater than the limit
      if (max_pod_per_time is not None) and len(deleting_pods) > max_pod_per_time:
        while len(deleting_pods) > 0:
          live_nodeActors_net = [nodeActors_net[x].metadata.name for x in self.mdvs.get_kube_resources(include=net_name, return_pods=False)]
          for p in deleting_pods:
            if p in live_nodeActors_net:
              print("Waiting deletion of Node Actor replica: {}".format(p))
            else:
              deleting_pods.remove(p)

          time.sleep(1)


    mentored_volume.compact_na_persistent_data()

    return None

  def get_nodeactors_names_as_list(self, net_name):
    nodeActors_net = self.mdvs.get_kube_resources(include=net_name)
    return list(nodeActors_net.keys())


class MentoredNetworkingKnetlab(MentoredNetworking):
  def get_kube_resources(self, return_pods=False, net_name=None):

    if return_pods:
      pod_list = self.kubeapi.list_namespaced_pod(self.namespace)

      pod_dict = {
        x.metadata.labels['device']: x for x in pod_list.items
        if 'device' in x.metadata.labels.keys() and net_name in x.metadata.labels['device']
      }

      return pod_dict

    n_list = self.api_instance.list_namespaced_custom_object(group="knetlab.rnp.br", version="v1beta1", namespace=self.namespace, plural="topologies")

    networking_dict = {
      x["metadata"]["name"]: x for x in n_list["items"]
    }

    return networking_dict

  def create_kube_resources(self, username, raw_device_list, network_type='ovs_fully_connected', wait_for_run=False):

    network_types = ['ovs_fully_connected', 'fully_connected', 'test_topology']
    if not (network_type in network_types):
      if type(network_type) != list:
        raise "invalid network_type. Current network_types = {}".format(network_types)

    # TODO: Fix name generator
    net_name = "mentorednetworking{}-{}-{}".format(self.next_networking_id,
                             username,
                             "mentored")

    self.net_name = net_name

    # TODO: Validation of raw_device_list

    containers_count = sum(
      [len(x['containers'])*x['replicas'] for x in raw_device_list]
    )


    device_list = []

    device_ifname_list = defaultdict(list, {})

    region_set = []


    # The first container is the main container
    main_container = defaultdict(lambda: None)

    device_name_to_name_actor = {}
    for na_raw in raw_device_list:
      na_name = na_raw['name']

      size = na_raw['replicas']
      containers = na_raw['containers']
      region = na_raw['region']

      na = NodeActor(username,
                     self.namespace,
                     net_name,
                     na_name,
                     size=size,
                     containers=containers,
                     region=region,
                     mode="knetlab",
                     kubeconfig_path=self.kubeconfig_path)

      self.nodeActors[na_name] = na

      if not region in region_set:
        region_set.append(region)

      for i in range(len(na)):
        device_list.append({
          'name': na.knetlab_devices_names[i],
          'type': 'host',
          'model': na.knetlab_devices_names[i],
          'region': region,
          'config': ''
        })

        device_name_to_name_actor[na.knetlab_devices_names[i]] = na_name

        main_container[na.knetlab_devices_names[i]] = containers[0]['name']

    if network_type == 'ovs_fully_connected':
      for region in region_set:
        ovs_name = '{}-ovs-{}'.format(net_name, region)
        device_list.append({
          'name': ovs_name,
          'type': 'switch',
          'model': 'ovs',
          'region': region,
          'config': ''
        })
    elif network_type == 'test_topology':
      ovs_name = '{}-ovs-ids-sc'.format(net_name)
      device_list.append({
        'name': ovs_name,
        'type': 'switch',
        'model': 'ovs',
        'region': 'ids-sc',
        'config': ''
      })

    # TODO: Option to use NETWORK SIMULATOR

    link_list = []

    # TODO: Ensure all ifname have <= 16 characters

    # All OVS will be conected in chain
    # The order is defined by the user, considering the same order that
    # regions appear in raw_device_list
    if network_type == 'ovs_fully_connected':
      ovs_device_list = [x for x in device_list if x['model'] == 'ovs']

      # Create all links between OVSs
      for i, dvc1 in enumerate(ovs_device_list[:-1]):
        dvc2 = ovs_device_list[i+1]
        j = i+1
        if dvc1 != dvc2:
          lname = '{}-{}'.format(dvc1['region'], dvc2['region'])
          rev_lname = '{}-{}'.format(dvc2['region'], dvc1['region'])

          link_list.append({
            'name': lname,
            'source':{
              'name': dvc1['name'],
              'ifname': lname
            },
            'destination':{
              'name': dvc2['name'],
              'ifname': rev_lname
            }
          })

          device_ifname_list[dvc1['name']].append(lname)
          device_ifname_list[dvc2['name']].append(rev_lname)


      host_device_list = [x for x in device_list if x['type'] == 'host']

      # Create all links between OVSs and the hosts inside its region
      for i, dvc_host in enumerate(host_device_list):
        region = dvc_host['region']
        ovs_name = '{}-ovs-{}'.format(net_name, region)

        lname = 'to-{}'.format(i)
        link_list.append({
          'name': lname,
          'source':{
            'name': dvc_host['name'],
            'ifname': 'ovs-link'.format(i)
          },
          'destination':{
            'name': ovs_name,
            'ifname': lname
          }
        })
        device_ifname_list[dvc_host['name']].append('ovs-link'.format(i))
        device_ifname_list[ovs_name].append(lname)
    elif network_type == 'fully_connected':
      for i, dvc1 in enumerate(device_list):
        for j,dvc2 in enumerate(device_list[i:]):
          if dvc1 != dvc2:
            lname = 'l{}-{}'.format(i, i+j)
            rev_lname = 'l{}-{}'.format(i+j, i)

            link_list.append({
              'name': lname,
              'source':{
                'name': dvc1['name'],
                'ifname': lname
              },
              'destination':{
                'name': dvc2['name'],
                'ifname': rev_lname
              }
            })

            device_ifname_list[dvc1['name']].append(lname)
            device_ifname_list[dvc2['name']].append(rev_lname)
    elif type(network_type) == list:
      for i, (na_name1, na_name2) in enumerate(network_type):
        j = 0
        for dvc1_name in self.nodeActors[na_name1].knetlab_devices_names:
          for dvc2_name in self.nodeActors[na_name2].knetlab_devices_names:
            lname = 'link{}'.format(i)
            ifname = 'link{}-{}'.format(i, j)
            rev_ifname = ifname

            link_list.append({
              'name': lname,
              'source':{
                'name': dvc1_name,
                'ifname': ifname
              },
              'destination':{
                'name': dvc2_name,
                'ifname': rev_ifname
              }
            })

            device_ifname_list[dvc1_name].append(ifname)
            device_ifname_list[dvc2_name].append(rev_ifname)
            j+=1

    elif network_type == 'test_topology':

      ovs_device_list = [x for x in device_list if x['model'] == 'ovs']
      for i, dvc1 in enumerate(ovs_device_list):
        for j,dvc2 in enumerate(device_list[i:]):
          if dvc1 != dvc2 and dvc2['type'] == 'host':
            lname = 'l{}-{}'.format(i, i+j)
            rev_lname = 'l{}-{}'.format(i+j, i)

            link_list.append({
              'name': lname,
              'source':{
                'name': dvc1['name'],
                'ifname': lname
              },
              'destination':{
                'name': dvc2['name'],
                'ifname': rev_lname
              }
            })

            device_ifname_list[dvc1['name']].append(lname)
            device_ifname_list[dvc2['name']].append(rev_lname)

    body = {
      "apiVersion": "knetlab.rnp.br/v1beta1",
      "kind": "Topology",
      "metadata": {
        "name": net_name
      },
      "spec": {
        "devices": device_list,
        "links": link_list
      }
    }

    with open(f"{net_name}.yaml", "w") as f:
      yaml_data = yaml.dump(body)
      f.write(yaml_data)

    networking = self.api_instance.create_namespaced_custom_object(
      group="knetlab.rnp.br",
      version="v1beta1",
      namespace=self.namespace,
      plural="topologies",
      body=body,
      async_req=False,
      _request_timeout=999999)

    self.next_networking_id+=1

    device_list_names = set([x['name'] for x in device_list])
    set_active_pods = set()

    ovs_device_list = [x for x in device_list if x['model'] == 'ovs']

    # Wait for the schedule of all pods    
    while len(device_list_names - set_active_pods) > 0:
      pod_list = self.get_kube_resources(return_pods=True,
                         net_name=net_name)

      set_active_pods = set(pod_list.keys())
      print(f"{len(device_list_names - set_active_pods)} Remaining: {device_list_names - set_active_pods}")
      time.sleep(1)


    warmup_finished = False
    # Wait for all pods change their status to 'Running'
    while not warmup_finished:
      pods = self.get_kube_resources(return_pods=True,
                                     net_name=net_name)

      waiting_status = []
      for x in pods:
        # Check the status of each container in the pod
        cstatus = pods[x].status.container_statuses
        # If the status is not available, then assumes that
        # it is not running
        if cstatus is None:
          waiting_status.append([True])
          continue

        wating_containers = []
        for y in cstatus:
          wating_containers.append(y.state.running is None)
        # print(f"Containers status:{wating_containers}")
        waiting_status.append(wating_containers)

      merged = list(itertools.chain(*waiting_status))

      # If at least 1 container/pod is not ready, the warmup will continue
      total_ready = len(merged) - sum(merged)
      warmup_finished = sum(merged) == 0
      print("Warmup phase... ({}/{} containers ready)".format(
        total_ready,
        containers_count+len(ovs_device_list)))

      time.sleep(1)

    ovs_device_list_name = [x['name'] for x in device_list if x['model'] == 'ovs']
    host_device_list_name = [x['name'] for x in device_list if x['type'] == 'host']

    # TODO: Collect and report STOUT/STDERR of Containers execs 
    for pod in ovs_device_list_name:
      if 'device' in pods[pod].metadata.labels.keys():
        dvc_name = pods[pod].metadata.labels['device']
        pod_name = pods[pod].metadata.name
        if dvc_name in ovs_device_list_name:
          cmd = '/usr/bin/ovs-vsctl add-br br0'
          print('[Container exec] {}$ {}'.format(dvc_name, cmd))
          container = main_container[dvc_name]
          result_cmd = self.pod_exec(pod_name, cmd, container=container)

          for ifname in device_ifname_list[dvc_name]:
            cmd = '/usr/bin/ovs-vsctl add-port br0 {}'.format(ifname)
            print('[Container exec] {}$ {}'.format(dvc_name, cmd))

            container = main_container[dvc_name]
            result_cmd = self.pod_exec(pod_name, cmd, container=container)


    node_actors_ips = defaultdict(list, {})

    # IP Definition
    if network_type == "ovs_fully_connected":
      for i, pod in enumerate(host_device_list_name):
        if 'device' in pods[pod].metadata.labels.keys():
          default_ifname, kube_ip_list =self. get_pod_ip_from_k8s(pods[pod])
          kube_ip = kube_ip_list[default_ifname]

          dvc_name = pods[pod].metadata.labels['device']
          pod_name = pods[pod].metadata.name


          na_name = device_name_to_name_actor[dvc_name]
          pod_ip_list = [
            [kube_ip, '32', default_ifname]
          ]
          for j, ifname in enumerate(device_ifname_list[dvc_name]):
            pod_ip = ['10.0.{}.{}'.format(j, i+2), '24', ifname]
            pod_ip_list.append(pod_ip)
            cmd = 'ip addr add {}/{} dev {}'.format(pod_ip[0],
                                                    pod_ip[1],
                                                    pod_ip[2])
            print('[Container exec] {}$ {}'.format(dvc_name, cmd))

            container = main_container[dvc_name]
            result_cmd = self.pod_exec(pod_name, cmd, container=container)

          node_actors_ips[na_name].append(pod_ip_list)

    elif network_type == "fully_connected" or type(network_type) == list:
      for i, link in enumerate(link_list):

        ifname1 = link['source']['ifname']
        ifname2 = link['destination']['ifname']

        dvc1_name = link['source']['name']
        dvc2_name = link['destination']['name']

        pod1_name = pods[dvc1_name].metadata.name
        pod2_name = pods[dvc2_name].metadata.name


        cmd = 'ip addr add 10.0.{}.2/24 dev {}'.format(i, ifname1)
        print('[Container exec] {}$ {}'.format(dvc1_name, cmd))
        container = main_container[dvc1_name]
        result_cmd = self.pod_exec(pod1_name, cmd, container=container)

        cmd = 'ip addr add 10.0.{}.3/24 dev {}'.format(i, ifname2)
        print('[Container exec] {}$ {}'.format(dvc2_name, cmd))
        container = main_container[dvc2_name]
        result_cmd = self.pod_exec(pod2_name, cmd, container=container)


    # Broadcast shared files
    pods = self.get_kube_resources(return_pods=True,
                                   net_name=net_name)
    for pod_name in pods:

      json_data = json.dumps(node_actors_ips,
                             indent=4,
                             sort_keys=True)

      yaml_data = yaml.dump(json.loads(json_data))

      container = main_container[pod_name]
      self.create_file_in_pod(pods[pod_name].metadata.name,
                              ['MENTORED_IP_LIST.json',
                               'MENTORED_IP_LIST.yaml'],
                              [json_data,
                               yaml_data],
                               container=container)

    for pod_name in pods:
      container = main_container[pod_name]
      self.create_file_in_pod(pods[pod_name].metadata.name,
                              ['MENTORED_READY'],
                              [''],
                              container=container)

    return networking


  def delete_kube_resources(self, net_name, wait_for_create=False):

    nodeActors_net = self.mdvs.get_kube_resources(include=net_name)
    for na in nodeActors_net:
      self.mdvs.delete_kube_resources(na, wait_for_create=True)

    kind = 'Status'
    while kind == 'Status':
      try:
        networking = self.api_instance.delete_namespaced_custom_object(
          group="knetlab.rnp.br",
          version="v1beta1",
          namespace=self.namespace,
          plural="topologies",
          name=net_name,
          async_req=False)
      except Exception as err:
        warnings.warn("[WARNING] {}".format(err))
        networking = err
        if wait_for_create:
          time.sleep(1)
          continue
        else:
          break

      # Case when deleting before creation is complete
      kind = networking['kind']


    return networking

if __name__ == "__main__":

  parser = argparse.ArgumentParser(description='Process some integers.')
  parser.add_argument('-c', dest='create', action='store_true')
  parser.add_argument('-l', dest='list', action='store_true')
  parser.add_argument('-d', dest='delete', action='store_true')
  parser.set_defaults(create=False)
  parser.set_defaults(list=False)
  parser.set_defaults(delete=False)

  args = parser.parse_args()
  # namespace = "mentored-lab"
  # namespace = "mentored-lab03"
  # namespace = "mentored-lab01"
  # namespace = "mentored-lab02"
  namespace = "mentored-lab03"

  mn = MentoredNetworking(namespace)

  start_time = time.time()


  if args.create:

    containers_list1 = [
      {
        "name": "bot-iot",
        "image": 'ghcr.io/brunomeyer/generic-botnet',
        # "image": 'allexmagno/iot-t50',
        "imagePullPolicy": "IfNotPresent",
        # "imagePullPolicy": "Always",
        "ports": [
          {
          "containerPort": 22,
          "name": "ssh"
          },
          {
          "containerPort": 5201,
          "name": "server"
          }
        ],
        "env": [
          {
            "name": "SERVER",
            "value": "10.0.0.2"
          },
          {
            "name": "PROTOCOL",
            "value": "ICMP"
          },
          {
            "name": "NET_INTERFACE",
            "value": "ovs-link"
          },
          {
            "name": "INGRESS_KBS",
            "value": "1024000"
          },
          {
            "name": "EGRESS_KBS",
            "value": "1024000"
          },
          {
            "name": "TIMEOUT_CMD",
            "value": "120"
            # "value": "60"
            # "value": "1"
          },
        ],
        "stdin": True,
        "tty": True,
        # "command": ["tail", "-f", "/dev/null"],
        "command": ["entry.sh"],
        # "args": ["hping3", "--rand-source", "-I", "ovs-link", "--flood", "-p", "80", "10.0.0.6"],
        # "args": ["hping3", "--rand-source", "-I", "ovs-link", "--faster", "-p", "80"],
        # "args": ["hping3", "-I", "ovs-link", "--faster", "-p", "80"],
        # "args": ["t50", "--flood", "--turbo", "--protocol", "$PROTOCOL", "-s", "$SERVER"],
        "args": ["hping3 -I ovs-link --faster -p 80"],
        # "args": ["t50 --flood --turbo --protocol $(PROTOCOL)"],
        "securityContext": {
          "privileged": True,
          "capabilities": {
            "add": [
              "NET_ADMIN"
            ]
          }
        },
        "resources": {
          "requests": {
            "memory": "64M",
            "cpu": "1000m"
          },
          "limits": {
            "memory": "128M",
            "cpu": "2000m"
          }
        }
      }
    ]

    containers_list2 = [
      {
        "name": "tcpdump",
        "image": "allexmagno/tcpdump",
        "imagePullPolicy": "IfNotPresent",
        "command": [
          "tcpdump"
        ],
        "stdin": True,
        "tty": True,
        "securityContext": {
          "capabilities": {
            "add": [
              "NET_ADMIN"
            ]
          }
        },
        "resources": {
          "requests": {
            "memory": "2G",
            "cpu": "4000m"
          },
          "limits": {
            "memory": "4G",
            "cpu": "8000m"
          }
        },
        "args": [
          "-i",
          "any",
          "-w",
          "pcaps/server.pcap"
        ]
      },
      {
        "name": "nginx",
        "image": "nginx",
        "imagePullPolicy": "IfNotPresent",
        "ports": [
          {
          "containerPort": 80
          },
          {
          "containerPort": 22
          },
          {
          "containerPort": 5201,
          "name": "server"
          }
        ],
        "stdin": True,
        "tty": True,
        "securityContext": {
          "capabilities": {
            "add": [
              "NET_ADMIN"
            ]
          }
        },
        "resources": {
          "requests": {
            "memory": "2G",
            "cpu": "4000m"
          },
          "limits": {
            "memory": "4G",
            "cpu": "8000m"
          }
        }
      }
    ]

    raw_device_list = [
      {
        'name': "ids-mg",
        'replicas': 1,
        'containers': containers_list2,
        'region': 'ids-mg'
      },
      {
        'name': 'whx-es',
        'replicas': 5,
        'containers': containers_list1,
        'region': 'whx-es'
      },
      # {
      #   'name': 'ids-pe',
      #   'replicas': 1,
      #   'containers': containers_list2,
      #   'region': 'ids-pe'
      # },
      # {
      #   'name': "whx-pa",
      #   'replicas': 4,
      #   'containers': containers_list1,
      #   'region': 'whx-pa'
      # }
    ]

    network_type = 'ovs_fully_connected'
    # network_type = 'fully_connected'

    print(mn.create_kube_resources("bruno", raw_device_list, wait_for_run=True, network_type=network_type), end="\n\n")
  if args.list:
    print(json.dumps(mn.get_kube_resources(), indent=4, sort_keys=True), end="\n\n")
  if args.delete:
    print(mn.delete_kube_resources("mentorednetworking0-bruno-mentored", wait_for_create=False), end="\n\n")
