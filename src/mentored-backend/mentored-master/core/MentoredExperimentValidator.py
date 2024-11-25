from cerberus import Validator
import yaml
import argparse
import os
from MentoredCluster import MentoredCluster
from MentoredComponent import MentoredComponent

class MentoredExperimentValidator(MentoredComponent):
  def __init__(self,
    schema_path="mentored-master/core/MentoredExperimentValidator.v1.yaml",
    schema_data=None,
    kubeconfig_path='/root/.kube/config',
    namespace='mentored'):
    
    if schema_data:
      self.schema = schema_data
    elif schema_path:
      with open(schema_path) as f:
        self.schema = yaml.load(f, Loader=yaml.FullLoader)
    else:
      raise Exception("No schema provided")
      
    self.v = Validator(self.schema)

    self.cluster = MentoredCluster(namespace=namespace, kubeconfig_path=kubeconfig_path)
    self.namespace = namespace
    self.kubeconfig_path = kubeconfig_path


  def validate(self, document):
    cerb_validation = self.v.validate(document)
    if not cerb_validation:
      return False, self.v.errors
    
    cluster_resources = self.cluster.get_nodes()
    cluster_resources_names = [x["name"] for x in cluster_resources]

    for nodeactor in document['Experiment']['nodeactors']:
      if nodeactor['region'] not in cluster_resources_names:
        return False, f"Region {nodeactor['region']} not found in cluster. Please choose from {cluster_resources_names}"

    return True, None
if __name__ == '__main__':

  parser = argparse.ArgumentParser(description='Process some integers.')
  parser.add_argument('-f', '--input_file', required=False,
                      help='Input YAML file to validate',
                      default=None,
                      type=str)
  parser.add_argument('-s', '--schema_file', required=False, default='MentoredExperimentValidator.v1.yaml')
  parser.add_argument('-n', dest='namespace', default='mentored')

  args = parser.parse_args()
  namespace = args.namespace
  
  with open(args.schema_file) as f:
    schema = yaml.load(f, Loader=yaml.FullLoader)

  default_test = {
    "Experiment": {
      "name": "Test Experiment",
      ""
      "nodeactors": [
        {
          "name": "nodeactor",
          "persitent_volume_path": ['a'],
          "region": "ids-go",
          "replicas": 0,
        },
      ],
      "topology": "None"
    }
  }

  if args.input_file:
    with open(args.input_file) as f:
      document = yaml.load(f, Loader=yaml.FullLoader)
  else:
    document = default_test

  rel_path = "~/.kube/config"
  abs_path = os.path.expanduser(rel_path)

  valiadtor = MentoredExperimentValidator(schema_data=schema, namespace=namespace, kubeconfig_path=abs_path)
  r, err_msg = valiadtor.validate(document)
  print(r)
  print(err_msg)

  # print(v.validate(document))
