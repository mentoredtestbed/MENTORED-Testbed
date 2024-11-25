from kubernetes import client, config
from MentoredComponent import MentoredComponent

from kubernetes import client, config, watch
import json

from tempfile import TemporaryFile
from kubernetes.stream import stream
from WSFileManager import WSFileManager
import tarfile
import os
import shutil
class MentoredVolume(MentoredComponent):

  def __init__(self, namespace, host_data_path, exp_id, default_persitent_volume_path=None, kubeconfig_path='/root/.kube/config'):
    super().__init__(namespace)
    self.kubeconfig_path = kubeconfig_path
    config.load_kube_config(kubeconfig_path)

    self.kubeapi = client.CoreV1Api()
    self.host_data_path = host_data_path
    self.default_persitent_volume_path = default_persitent_volume_path
    self.exp_id = exp_id
    self.next_volume_id = 0

  def get_pv_path(self):
    return self.default_persitent_volume_path

  # https://stackoverflow.com/questions/59703610/copy-file-from-pod-to-host-by-using-kubernetes-python-client
  def stream_copy_from_pod(self, pod_name, source_path, destination_path, container=None):
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
        if container is None:
          exec_stream = stream(self.kubeapi.connect_get_namespaced_pod_exec, pod_name, name_space,
                              command=command_copy, stderr=True, stdin=True, stdout=True, tty=False,
                              _preload_content=False)
        else:
           exec_stream = stream(self.kubeapi.connect_get_namespaced_pod_exec, pod_name, name_space,
                              command=command_copy, stderr=True, stdin=True, stdout=True, tty=False,
                              _preload_content=False, container=container)
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

        except Exception as e:
            raise e

  def save_pod_data(self, pod_name, pod_path, container=None, prefix=None, tarname=None):
    if tarname is None:
       tarname = pod_name

    if container is None:
      fname = tarname+".tar"
    else:
      fname = tarname+"_"+container+".tar"

    fname = fname
    print("Saving pod data to: ", fname)

    if prefix is None:
      dst_path = os.path.join(self.host_data_path, str(self.exp_id), fname)
    else:
      dst_path = os.path.join(self.host_data_path, str(self.exp_id), prefix, fname)
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    self.stream_copy_from_pod(pod_name, pod_path, dst_path, container=container)

  def save_text_as_file(self, content, fname):
    dst_path = os.path.join(self.host_data_path, str(self.exp_id))
    os.makedirs(dst_path, exist_ok=True)
    dst_file = os.path.join(dst_path, fname)
    with open(dst_file, "w") as f:
        f.write(content)

  def save_files_in_pd(self, files_content, file_names, compact_name):
    dst_path = os.path.join(self.host_data_path, str(self.exp_id))
    os.makedirs(dst_path, exist_ok=True)
    dst_file = os.path.join(dst_path, compact_name)
    with tarfile.open(dst_file, "w") as tf:
      for data, fname in zip(files_content, file_names):
        file_path = os.path.join(dst_path, fname)
        with open(file_path, "w") as f:
            f.write(data)
        tf.add(file_path, arcname=fname)
    # Remove files
    for f in file_names:
        f_path = os.path.join(dst_path, f)
        os.remove(f_path)

  def compact_na_persistent_data(self):
    dst_path = os.path.join(self.host_data_path, str(self.exp_id))
    os.makedirs(dst_path, exist_ok=True)
    dst_file = os.path.join(dst_path, "experiment_{}.tar.gz".format(self.exp_id))

    with tarfile.open(dst_file, "w:gz") as tf:
      for f in os.listdir(dst_path):
        f_path = os.path.join(dst_path, f)
        if f_path != dst_file:
          tf.add(f_path, arcname=f)

    for f in os.listdir(dst_path):
      f_path = os.path.join(dst_path, f)
      if f_path != dst_file:
        if os.path.isfile(f_path):
            os.remove(f_path)
        elif os.path.isdir(f_path):
            shutil.rmtree(f_path)

  def get_experiment_data(self):
    dst_path = os.path.join(self.host_data_path, str(self.exp_id))
    return os.path.join(dst_path, "experiment_{}.tar.gz".format(self.exp_id))

  def get_log_data(self, only_fname=False):
    if only_fname:
      return "experiment_logs_{}.tar".format(self.exp_id)

    dst_path = os.path.join(self.host_data_path, str(self.exp_id))
    return os.path.join(dst_path, "experiment_logs_{}.tar".format(self.exp_id))


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