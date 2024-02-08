from kubernetes import client, config
from MentoredComponent import MentoredComponent

from kubernetes import client, config, watch
import json

from tempfile import TemporaryFile
from kubernetes.stream import stream
from WSFileManager import WSFileManager
import tarfile
import os

class MentoredVolume(MentoredComponent):

  def __init__(self, namespace, host_data_path, exp_id, default_persitent_volume_path=None):
    super().__init__(namespace)
    config.load_kube_config()
    self.kubeapi = client.CoreV1Api()
    self.host_data_path = host_data_path
    self.default_persitent_volume_path = default_persitent_volume_path
    self.exp_id = exp_id
    

    self.next_volume_id = 0

  def get_pv_path(self):
    return self.default_persitent_volume_path

  # https://stackoverflow.com/questions/59703610/copy-file-from-pod-to-host-by-using-kubernetes-python-client
  def stream_copy_from_pod(self, pod_name, source_path, destination_path):
    """
    Copy file from pod to the host.

    :param pod_name: String. Pod name
    :param name_space: String. Namespace
    :param source_path: String. Pod destination file path
    :param destination_path: Host destination file path
    :return: bool
    """
    name_space = self.namespace

    # "experiment_{}".format(self.exp_id)
    # command_copy = ['tar', '-cf', "--to-stdout", "-C", source_path, "."]
    command_copy = ['tar', 'cf', '-', source_path]

    # with TemporaryFile() as tar_buffer:

    # TODO: Add limit to tar size 
    with open(destination_path, "wb+") as tar_buffer:
        exec_stream = stream(self.kubeapi.connect_get_namespaced_pod_exec, pod_name, name_space,
                             command=command_copy, stderr=True, stdin=True, stdout=True, tty=False,
                             _preload_content=False)
        # Copy file to stream
        try:
            reader = WSFileManager(exec_stream)
            while True:
                out, err, closed = reader.read_bytes()
                if out:
                    tar_buffer.write(out)
                elif err:
                    print("Error copying file {0}".format(err.decode("utf-8", "replace")))
                if closed:
                    break
            exec_stream.close()
            tar_buffer.flush()
            tar_buffer.seek(0)
            return True
        
            # with tarfile.open(fileobj=tar_buffer, mode='r:') as tar:
            #     # member = tar.getmember(source_path)
            #     # tar.makefile(member, destination_path)

            #     # tarinfo = tar.next()
            #     # fileobj = tar.extractfile(tarinfo)

            #     # with tarfile.open(destination_path, 'w|') as output_tar:
            #     #   output_tar.addfile(tarinfo, fileobj)

            #     # tar.extractall(destination_path)

            #     # with tarfile.open(destination_path, 'w:gz') as tar_gz:
            #     #   # Iterate through the members of the original tar file
            #     #   for member in tar.getmembers():
            #     #     # Add each member to the new tar.gz file
            #     #     fileobj = tar.extractfile(member)
            #     #     tar_info = tarfile.TarInfo(name=member.name)
            #     #     tar_info.size = member.size
            #     #     tar_gz.addfile(tar_info, fileobj=fileobj)

                  
            #     #   # tar_gz.add(tar.getnames()[0], arcname='')
            #     #   # tar_gz.add(source_path, arcname='')

            # with tarfile.open(fileobj=tar_buffer, mode='rb:') as tar:
            #   with open(destination_path, "wb") as output_tar:
            #     # Write bytes to file
            #     output_tar.write(tar)

            #   return True
            
        except Exception as e:
            raise e

  def save_pod_data(self, pod_name, pod_path):
    dst_path = os.path.join(self.host_data_path, str(self.exp_id), pod_name+".tar")
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    self.stream_copy_from_pod(pod_name, pod_path, dst_path)
  
  def compact_na_persistent_data(self):
    dst_path = os.path.join(self.host_data_path, str(self.exp_id))
    dst_file = os.path.join(dst_path, "experiment_{}.tar.gz".format(self.exp_id))

    with tarfile.open(dst_file, "w:gz") as tf:
      for f in os.listdir(dst_path):
        f_path = os.path.join(dst_path, f)
        print(f_path, dst_file)
        if f_path != dst_file:
          tf.add(f_path, arcname=f)

    for f in os.listdir(dst_path):
      f_path = os.path.join(dst_path, f)
      print(f_path, dst_file)
      if f_path != dst_file:
        os.remove(f_path)
  
  def get_experiment_data(self):
     dst_path = os.path.join(self.host_data_path, str(self.exp_id))
     return os.path.join(dst_path, "experiment_{}.tar.gz".format(self.exp_id))
     

  # TODO: Use PVC as main storage system
  '''
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
  '''
  
if __name__ == "__main__":

  mpvc = MentoredVolume("mentored", "./persistent-data/", 0)
  # print(mpvc.create_kube_resources("bruno"))
  # print(mpvc.get_kube_resources().keys())
  # print(mpvc.delete_kube_resources("mentoredvolume0-bruno-mentored"))