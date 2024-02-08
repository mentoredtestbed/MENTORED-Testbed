from MentoredComponent import MentoredComponent

from kubernetes import client, config, watch
import kubernetes

import warnings
import json
import time

import yaml

class MentoredDeviceSoftware(MentoredComponent):
  def __init__(self, namespace, kubeconfig_path='/root/.kube/config'):
    super().__init__(namespace)
    config.load_kube_config(kubeconfig_path)
    self.kubeapi = client.CoreV1Api()

    configuration = config.load_kube_config(kubeconfig_path)

    self.api_instance = None

    self.next_devicesoftware_id = 0


  def get_network_attachment_definitions(self, region):
    nad = {
      "ids-sc": "macvlan-ids-sc-701",
      "ids-go": "macvlan-ids-go-2902",
      "ids-pe": "macvlan-ids-pe-1524",
    }

    return nad[region]

class MentoredDeviceSoftwareKnetlab(MentoredDeviceSoftware):

  def __init__(self, namespace, kubeconfig_path='/root/.kube/config'):
    super().__init__(namespace, kubeconfig_path)
    with kubernetes.client.ApiClient(self.configuration) as api_client:
      self.api_instance = kubernetes.client.CustomObjectsApi(api_client)


  def get_kube_resources(self, include=None):
    d_list = self.api_instance.list_namespaced_custom_object(group="knetlab.rnp.br", version="v1", namespace=self.namespace, plural="devices")
    

    devicesoftware_dict = {
      x["metadata"]["name"]: x for x in d_list["items"]
    }

    if not include is None:
      devicesoftware_dict = {
        x["metadata"]["name"]: x for x in d_list["items"]
        if include in x["metadata"]["name"]
      }

    return devicesoftware_dict
  
  
  def specify_device_features(self, body, device_features):
    if "region" in device_features:
      cni = self.get_network_attachment_definitions(device_features["region"])
      md = body["metadata"]
      if not "annotations" in metadata:
        body["metadata"]["annotations"] = {"k8s.v1.cni.cncf.io/networks": cni}
      else:
        body["metadata"]["annotations"]["k8s.v1.cni.cncf.io/networks"] = cni
    
    return body

  def create_kube_resources(self, username, containers, d_name=None, device_features=None):
    if d_name is None:
      d_name = "mentoreddevicesoftware{}-{}-{}".format(self.next_devicesoftware_id, username, "mentored")
    
    region = device_features["region"] if "region" in device_features else None
    
    body = {
      "apiVersion": "knetlab.rnp.br/v1",
      "kind": "Device",
      "metadata": {
        "name": "{}".format(d_name),
        "labels": {
        "app": "{}".format(d_name)
        }
      },
      "spec": {
        "template": {
          "spec": {
            "containers": containers,
            "imagePullSecrets": [
            {
              "name": "regcred"
            }
            ],
            "nodeSelector": {
              "kubernetes.io/hostname": region
            }
          }
        }
      }
    }
    
    if not (device_features is None):
      body = self.specify_device_features(body, device_features)

    # with open(f"{d_name}.yaml", "w") as f:
    #   yaml_data = yaml.dump(body)
    #   f.write(yaml_data)

    device = self.api_instance.create_namespaced_custom_object(group="knetlab.rnp.br", version="v1", namespace=self.namespace, plural="devices", body=body, async_req=False, _request_timeout=999999)

    return device

  def delete_kube_resources(self, d_name, wait_for_create=False):

    kind = 'Status'
    device = self.api_instance.delete_namespaced_custom_object(
      group="knetlab.rnp.br",
      version="v1",
      namespace=self.namespace,
      plural="devices",
      name=d_name,
      async_req=False)
          
    kind = device['kind']

    return device


class MentoredDeviceSoftwareKubectl(MentoredDeviceSoftware):

  def __init__(self, namespace, persitent_volume_path=None):
    super().__init__(namespace)
    with kubernetes.client.ApiClient() as api_client:
      # Create an instance of the API class
      self.api_instance = kubernetes.client.CoreV1Api(api_client)
      self.persitent_volume_path = persitent_volume_path



  def get_kube_resources(self, include=None):
    d_list = self.api_instance.list_namespaced_pod(self.namespace, watch=False)
    

    devicesoftware_dict = {
      x.metadata.name: x for x in d_list.items
    }

    if not include is None:
      devicesoftware_dict = {
        x.metadata.name: x for x in d_list.items
        if include in x.metadata.name
        and x.metadata.namespace == self.namespace
      }

    return devicesoftware_dict

  def specify_device_features(self, body, device_features):
    if "region" in device_features:
      print(device_features)
      cni = self.get_network_attachment_definitions(device_features["region"])
      if not "annotations" in body["metadata"]:
        body["metadata"]["annotations"] = {"k8s.v1.cni.cncf.io/networks": cni}
      else:
        body["metadata"]["annotations"]["k8s.v1.cni.cncf.io/networks"] = cni
    
    return body
    
  def create_kube_resources(self, username, containers, d_name=None, device_features=None):
    if d_name is None:
      d_name = "mentoreddevicesoftware{}-{}-{}".format(self.next_devicesoftware_id, username, "mentored")
    

    region = device_features["region"] if "region" in device_features else None
    
    body = {
      "apiVersion": "v1",
      "kind": "Pod",
      "metadata": {
        "name": "{}".format(d_name),
        "labels": {
          "app": "{}".format(d_name),
          "device": "{}".format(d_name)
        },
        "annotations": {
          "persitent_volume_path": str(self.persitent_volume_path)
        }
      },
      "spec": {
        "containers": containers,
        "imagePullSecrets": [
          {
            "name": "regcred"
          }
        ],
        "nodeSelector": {
          "kubernetes.io/hostname": region
        }
      }
    }

    if not (device_features is None):
      body = self.specify_device_features(body, device_features)

    print(body)

    # with open(f"{d_name}.yaml", "w") as f:
    #   yaml_data = yaml.dump(body)
    #   f.write(yaml_data)

    device = self.api_instance.create_namespaced_pod(
      namespace=self.namespace,
      body=body,
      async_req=False,
      _request_timeout=999999)

    return device

  def delete_kube_resources(self, d_name, wait_for_create=False):

    kind = 'Status'
    device = self.api_instance.delete_namespaced_pod(
      namespace=self.namespace,
      name=d_name,
      async_req=False)
          
    kind = device.kind

    return device
  
if __name__ == "__main__":

  # namespace = "mentored"
  namespace = "mentored-lab01"
  mdvs = MentoredDeviceSoftware(namespace)

  env = [
    {
      "name": "SERVER",
      "value": "10.1.1.103"
    },
    {
      "name": "PROTOCOL",
      "value": "ICMP"
    },
    {
      "name": "NET_INTERFACE",
      "value": "net1"
    },
    {
      "name": "INGRESS_KBS",
      "value": "1024000"
    },
    {
      "name": "EGRESS_KBS",
      "value": "1024000"
    }
  ]
  print(mdvs.create_kube_resources("bruno", "ghcr.io/brunomeyer/generic-botnet", env), end="\n\n")
  print(mdvs.get_kube_resources().keys())
  print(mdvs.delete_kube_resources("mentoreddevicesoftware0-bruno-mentored", wait_for_create=True))
