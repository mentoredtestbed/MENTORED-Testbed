from kubernetes import client, config

class MentoredComponent:

  def __init__(self, namespace):
    self.namespace = namespace
  