# Mock data
# TODO: Implement database access with the containers definitions
 
class MentoredDataService():
  def __init__(self):
    pass
  
  def get_device_software(self, name_id):
    database = {
      'meu_device_software1': [
        {
          "name": "meu-device-software1",
          # "image": 'python:3.6.15-buster',
          "image": 'ghcr.io/brunomeyer/generic-botnet',
          "command": ["tail", "-f", "/dev/null"],
          "imagePullPolicy": "IfNotPresent",
          "stdin": True,
          "tty": True,
          "securityContext": {
            "privileged": True,
            "capabilities": {
              "add": [
                "NET_ADMIN"
              ]
            }
          },
        }
      ],

      'meu_device_software2': [
        {
          "name": "meu-device-software2",
          # "image": 'python:3.6.15-buster',
          "image": 'ghcr.io/brunomeyer/generic-botnet',
          "command": ["tail", "-f", "/dev/null"],
          "imagePullPolicy": "IfNotPresent",
          "stdin": True,
          "tty": True,
          "securityContext": {
            "privileged": True,
            "capabilities": {
              "add": [
                "NET_ADMIN"
              ]
            }
          },
        }
      ],
      'ovs': [
        {
          "name": "ovs",
          # "image": 'python:3.6.15-buster',
          "image": 'globocom/openvswitch',
          "imagePullPolicy": "IfNotPresent",
          "stdin": True,
          "tty": True,
          "securityContext": {
            "privileged": True,
            "capabilities": {
              "add": [
                "NET_ADMIN"
              ]
            }
          },
        }
      ],
    }

    if name_id in database:
      return database[name_id]
    else:
      return None
