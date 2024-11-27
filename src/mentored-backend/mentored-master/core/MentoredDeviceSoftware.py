from MentoredComponent import MentoredComponent

from kubernetes import client, config, watch
import kubernetes

import warnings
import json
import time

import yaml

import pprint

class MentoredDeviceSoftware(MentoredComponent):
  def __init__(self, namespace, kubeconfig_path='/root/.kube/config'):
    self.kubeconfig_path = kubeconfig_path
    super().__init__(namespace)
    config.load_kube_config(kubeconfig_path)
    self.kubeapi = client.CoreV1Api()

    configuration = config.load_kube_config(kubeconfig_path)

    self.api_instance = None

    self.next_devicesoftware_id = 0


  def get_network_attachment_definitions(self, region):
    # Automatically get network-attachment-definitions
    # equivalent to: kubectl get network-attachment-definitions

    configuration = config.load_kube_config(self.kubeconfig_path)
    with kubernetes.client.ApiClient(configuration) as tmp_api:
      custom_api_client = kubernetes.client.CustomObjectsApi(tmp_api)

    # Check custom object network-attachment-definitions exist
    nad = None
    try:
      nad = custom_api_client.list_namespaced_custom_object("k8s.cni.cncf.io", "v1", self.namespace, "network-attachment-definitions")
    except kubernetes.client.rest.ApiException as e:
      if e.status == 404:
        warnings.warn("Network attachment definitions not found")
        return None
      else:
        raise e

    # Assuming multus is installed
    # d_list = self.api_instance.list_namespaced_custom_object(group="knetlab.rnp.br", version="v1", namespace=self.namespace, plural="devices")
    cluster_nad_list = custom_api_client.list_namespaced_custom_object(group="k8s.cni.cncf.io", version="v1", namespace=self.namespace, plural="network-attachment-definitions")
    # pprint.pprint(cluster_nad_list, compact=True)
    ret_value = None
    for nad in cluster_nad_list["items"]:
      nad_name = nad["metadata"]["name"]
      if region in nad_name:
        if not ret_value is None:
          warnings.warn(f"More than one network attachment definition found for the region ({nad_name}). Returning the first one found: {ret_value}")
          continue
        ret_value = nad_name

    return ret_value


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
      if not "annotations" in md:
        body["metadata"]["annotations"] = {"k8s.v1.cni.cncf.io/networks": cni}
      else:
        body["metadata"]["annotations"]["k8s.v1.cni.cncf.io/networks"] = cni

    return body

  def create_kube_resources(self, username, containers, d_name=None, device_features=None):
    if d_name is None:
      d_name = "mentoreddevicesoftware{}-{}-{}".format(self.next_devicesoftware_id, username, "mentored")

    if device_features is None:
      device_features = {}
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

  def __init__(self, namespace, kubeconfig_path='/root/.kube/config', persitent_volume_path=None):
    super().__init__(namespace, kubeconfig_path=kubeconfig_path)
    with kubernetes.client.ApiClient() as api_client:
      # Create an instance of the API class
      self.api_instance = kubernetes.client.CoreV1Api(api_client)
      self.k8s_apps_v1 = kubernetes.client.AppsV1Api(api_client)
      self.persitent_volume_path = persitent_volume_path

    self.env = [
      {
        "name": "MENTORED_PERSISTENT_VOLUME_PATH",
        "value": self.persitent_volume_path
      },
      {
        "name": "MENTORED_EXP_IFNAME",
        "value": "net1"
      },
    ]

  def get_pods_from_deployment(self, deployment_name):
    # Get the deployment object using the AppsV1Api
    deployment = self.k8s_apps_v1.read_namespaced_deployment(name=deployment_name, namespace=self.namespace)
    
    # Get the label selector from the deployment spec
    label_selector = deployment.spec.selector.match_labels

    # Convert the labels to a string for use in the label_selector query
    selector_str = ",".join([f"{key}={value}" for key, value in label_selector.items()])

    # List all pods in the namespace that match the label selector
    pods = self.api_instance.list_namespaced_pod(self.namespace, label_selector=selector_str)

    return pods.items

  def get_kube_resources(self, include=None, return_pods=True):
    if return_pods:
      # print("MentoredDeviceSoftwareKubectl->get_kube_resources(): Getting pods")
      d_list = self.api_instance.list_namespaced_pod(self.namespace, watch=False)
    else:
      # print("MentoredDeviceSoftwareKubectl->get_kube_resources(): Getting deployments")
      d_list = self.k8s_apps_v1.list_namespaced_deployment(self.namespace, watch=False)      


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
      cni = self.get_network_attachment_definitions(device_features["region"])
      if cni is None:
        warnings.warn("Region not found in network attachment definitions")
      else:
        if not "annotations" in body["metadata"]:
          body["metadata"]["annotations"] = {"k8s.v1.cni.cncf.io/networks": cni}
          # For deployment's template of pod
          body["spec"]["template"]["metadata"]["annotations"] = {"k8s.v1.cni.cncf.io/networks": cni}
        else:
          body["metadata"]["annotations"]["k8s.v1.cni.cncf.io/networks"] = cni
          # For deployment's template of pod
          body["spec"]["template"]["metadata"]["annotations"]["k8s.v1.cni.cncf.io/networks"] = cni


    if "mentored_replica_id" in device_features:
      body["metadata"]["labels"]["mentored_replica_id"] = device_features["mentored_replica_id"]

    if "mentored_na_name" in device_features:
      body["metadata"]["labels"]["mentored_na_name"] = device_features["mentored_na_name"]

    return body

  def inject_env_variables(self, body):
    if "spec" in body:
      if "containers" in body["spec"]:
        for i, container in enumerate(body["spec"]["containers"]):

          # Copy is needed to avoid changing the original list
          if "env" in container:
            container["env"] = container["env"] + self.env.copy()
          else:
            container["env"] = self.env.copy()

          # if is using persistent volume paths
          if "MENTORED_PERSISTENT_VOLUME_PATH" in [x["name"] for x in container["env"]]:
            # Get the index of the MENTORED_PERSISTENT_VOLUME_PATH
            pvp_idx = container["env"].index(
              [x for x in container["env"]
              if x["name"] == "MENTORED_PERSISTENT_VOLUME_PATH"][0]
            )

            pvp = container["env"][pvp_idx]["value"]
            if type(pvp) == list:
              container["env"][pvp_idx] = container["env"][pvp_idx].copy() # Copy to avoid changing the original list
              # The list can be smaller than the number of containers
              if i < len(pvp):
                container["env"][pvp_idx]["value"] = pvp[i]
              else:
                del container["env"][pvp_idx]
    return body

  def create_kube_resources(self, username, containers, d_name=None, device_features=None, cluster=None):
    if d_name is None:
      d_name = "mentoreddevicesoftware{}-{}-{}".format(self.next_devicesoftware_id, username, "mentored")

    if device_features is None:
      device_features = {}
    region = device_features["region"] if "region" in device_features else None

    for container in containers:
      if "volumeMounts" in container:
        container["volumeMounts"] = [{
          "name": "mentored-storage-public-"+self.namespace,
          "mountPath": "/mentored-storage-public",
          "readOnly": True
        }]
    # TODO: Change "device" to "mentoreddevice"

    # Check if mentored-storage-public-"+self.namespace is available
    pvc = None
    try:
      print("Checking if persistent volume claim exists")
      pvc = self.api_instance.list_namespaced_persistent_volume_claim(self.namespace)
      pvc_names = [x.metadata.name for x in pvc.items]
      pvc = self.namespace in pvc_names
      if pvc:
        print(f"Persistent volume claim found in {pvc_names}" if not pvc is None else "Persistent volume claim not found")
      else:
        warnings.warn("Persistent volume claim not found")
    except kubernetes.client.rest.ApiException as e:
      if e.status == 404:
        warnings.warn("Persistent volume claim not found")
        pvc = None
      else:
        raise e

    body = {
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
        "name": "{}".format(d_name),
        "labels": {
            "app": "{}".format(d_name),
            "device": "{}".format(d_name),
            "location": "{}".format(cluster)
        },
        "annotations": {
            "persitent_volume_path": json.dumps(self.persitent_volume_path)
        }
    },
    "spec": {
        "replicas": 1,  # You can modify the number of replicas
        "selector": {
            "matchLabels": {
                "app": "{}".format(d_name)
            }
        },
        "template": {
            "metadata": {
                "labels": {
                    "app": "{}".format(d_name),
                    "device": "{}".format(d_name)
                },
                "annotations": {
                },  
            },
            "spec": {
                "volumes": [
                    {
                        "name": "mentored-storage-public-"+self.namespace,
                        "persistentVolumeClaim": {
                            "claimName": "mentored-storage-public-"+self.namespace
                        }
                    }
                ] if pvc else [],
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
    # print(f"Creating deployment {d_name} with the following body:")
    # print(json.dumps(body, indent=2))

    if not (device_features is None):
      body = self.specify_device_features(body, device_features)

    body = self.inject_env_variables(body)

    # Printing the body with indentation for large experiments is to verbose
    print(body)
    # print(json.dumps(body, indent=2))

    # with open(f"{d_name}.yaml", "w") as f:
    #   yaml_data = yaml.dump(body)
    #   f.write(yaml_data)

    device = self.k8s_apps_v1.create_namespaced_deployment(
      namespace=self.namespace,
      body=body,
      async_req=False,
      _request_timeout=999999)

    return device

  def delete_kube_resources(self, d_name, wait_for_create=False):

    kind = 'Status'
    device = self.k8s_apps_v1.delete_namespaced_deployment(
      namespace=self.namespace,
      name=d_name,
      async_req=False)

    kind = device.kind

    return device

if __name__ == "__main__":

  namespace = "mentored"
  # namespace = "grupo-1"
  # namespace = "mentored-lab01"
  mdvs = MentoredDeviceSoftwareKubectl(namespace)

  print(mdvs.get_network_attachment_definitions("ids-pe"))

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
