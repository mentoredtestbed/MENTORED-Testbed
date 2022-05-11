from kubernetes import client, config
from MentoredComponent import MentoredComponent

from kubernetes import client, config, watch
import json

class MentoredVolume(MentoredComponent):

  def __init__(self, namespace):
    super().__init__(namespace)
    config.load_kube_config()
    self.kubeapi = client.CoreV1Api()

    self.next_volume_id = 0

  def get_kube_resources(self):
    pvc_list = self.kubeapi.list_namespaced_persistent_volume_claim(self.namespace)
    pvc_dict = {
      x.metadata.name: x for x in pvc_list.items
    }
    return pvc_dict

  def create_kube_resources(self, username, volume_size=2):
    pvc_name = "mentoredvolume{}-{}-{}".format(self.next_volume_id, username, "mentored")
    
    body = {
      "apiVersion": "v1",
      "kind": "PersistentVolumeClaim",
      "metadata": {
        # "creationTimestamp": None,
        "labels": {
        # "app": "meuapp-novo",
        "type": "local"
        },
        "name": pvc_name,
        "namespace": "mentored"
      },
      "spec": {
        "accessModes": [
          "ReadWriteMany"
        ],
        "resources": {
          "requests": {
            "storage": "{}Gi".format(volume_size)
          }
        },
        "storageClassName": "nfs-mentored"
      }
    }

    self.next_volume_id+=1
    pvc = self.kubeapi.create_namespaced_persistent_volume_claim(self.namespace, body)
    return pvc

  def delete_kube_resources(self, pvc_name):
    pvc = self.kubeapi.delete_namespaced_persistent_volume_claim(pvc_name, self.namespace)
    return pvc
  
if __name__ == "__main__":

  mpvc = MentoredVolume("mentored")
  print(mpvc.create_kube_resources("bruno"))
  print(mpvc.get_kube_resources().keys())
  print(mpvc.delete_kube_resources("mentoredvolume0-bruno-mentored"))