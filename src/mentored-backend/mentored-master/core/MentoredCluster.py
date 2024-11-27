from kubernetes import client, config
from MentoredComponent import MentoredComponent

import kubernetes
from kubernetes import client, config, watch
import json

from tempfile import TemporaryFile
from kubernetes.stream import stream
from WSFileManager import WSFileManager
import tarfile
import os

MUST_HAVE_LABEL = [
   ("mentored", "ready")
]

# Function to convert Kubernetes CPU and memory units to a common format
def parse_quantity(q):
    units = {'Ki': 1024, 'Mi': 1024**2, 'Gi': 1024**3, 'Ti': 1024**4, 'Pi': 1024**5, 'm': 1/1000, 'n': 1/1000000, 'u': 1/1000000000}
    if q[-1].isdigit(): # e.g., '100m' or '1234'
        return float(q)
    for unit, multiplier in units.items():
        if q.endswith(unit):
            return float(q[:-len(unit)]) * multiplier
    return float(q)

class MentoredCluster(MentoredComponent):

  def __init__(self, namespace, kubeconfig_path='/root/.kube/config'):
    super().__init__(namespace)
    config.load_kube_config(kubeconfig_path)
    self.kubeapi = client.CoreV1Api()

    configuration = config.load_kube_config(kubeconfig_path)
    with kubernetes.client.ApiClient(configuration) as api_client:
      self.api_instance = kubernetes.client.CustomObjectsApi(api_client)

    self.next_volume_id = 0

  def get_nodes(self):
    return [
      {
        'name': n.metadata.name,
        'labels': n.metadata.labels,
        'status': n.status.conditions,
        'cpu_capacity': n.status.capacity['cpu'],
        'memory_capacity': n.status.capacity['memory'],
      }
      for n in self.kubeapi.list_node().items
      if all((n.metadata.labels.get(k) == v for k, v in MUST_HAVE_LABEL)) and
         n.status.conditions is not None
         and len([c for c in n.status.conditions if c.type == 'Ready' and c.status == 'True'])
    ]

  def get_kube_resources(self):

    # List all nodes
    nodes = self.kubeapi.list_node()

    # Dictionary to store total resources by node
    node_resources = {}
    for node in nodes.items:
        if not all((node.metadata.labels.get(k) == v for k, v in MUST_HAVE_LABEL)):
            continue
        if node.status.conditions is None:
            continue
        if not len([c for c in node.status.conditions if c.type == 'Ready' and c.status == 'True']):
            continue

        name = node.metadata.name
        cpu_capacity = node.status.capacity['cpu']
        memory_capacity = node.status.capacity['memory']
        node_resources[name] = {
            'cpu_capacity': cpu_capacity,
            'memory_capacity': memory_capacity
        }

    # Get node metrics
    k8s_nodes_metrics = self.api_instance.list_cluster_custom_object("metrics.k8s.io", "v1beta1", "nodes")

    cluster_info = []
    for stats in k8s_nodes_metrics['items']:
        node_name = stats['metadata']['name']
        if node_name not in node_resources:
            continue

        cpu_usage = parse_quantity(stats['usage']['cpu'])
        memory_usage = parse_quantity(stats['usage']['memory'])
        cpu_capacity = parse_quantity(node_resources[node_name]['cpu_capacity'])*1000
        memory_capacity = parse_quantity(node_resources[node_name]['memory_capacity'])

        # Calculate percentage usage
        cpu_percent = (cpu_usage / cpu_capacity) * 100
        memory_percent = (memory_usage / memory_capacity) * 100

        cluster_info.append({
            'node_name': node_name,
            'cpu_usage': cpu_usage,
            'cpu_capacity': cpu_capacity,
            'memory_usage': memory_usage,
            'memory_usage_gb': f"{memory_usage/1024**3:.2f}",
            'memory_capacity': memory_capacity,
            'memory_capacity_gb': f"{memory_capacity/1024**3:.2f}",
            'cpu_percent': f"{cpu_percent:.2f}%",
            'memory_percent': f"{memory_percent:.2f}%",
            'ncores': cpu_capacity/1000,
            'ncores_used': cpu_usage/1000,
        })

    return {
        'workers': cluster_info
    }


if __name__ == "__main__":
  rel_path = "~/.kube/config"
  abs_path = os.path.expanduser(rel_path)
  workers = MentoredCluster("mentored", kubeconfig_path=abs_path).get_kube_resources()
  print(workers)