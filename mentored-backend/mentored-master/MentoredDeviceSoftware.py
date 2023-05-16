from MentoredComponent import MentoredComponent

from kubernetes import client, config, watch
import kubernetes

import warnings
import json
import time

import yaml

class MentoredDeviceSoftware(MentoredComponent):

  def __init__(self, namespace):
    super().__init__(namespace)
    config.load_kube_config('/root/.kube/config')
    self.kubeapi = client.CoreV1Api()

    configuration = config.load_kube_config('/root/.kube/config')

    with kubernetes.client.ApiClient(configuration) as api_client:
      self.api_instance = kubernetes.client.CustomObjectsApi(api_client)

    self.next_devicesoftware_id = 0

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

  def create_kube_resources(self, username, containers, d_name=None):
    if d_name is None:
      d_name = "mentoreddevicesoftware{}-{}-{}".format(self.next_devicesoftware_id, username, "mentored")
    
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
          ]
        }
        }
      }
    }

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