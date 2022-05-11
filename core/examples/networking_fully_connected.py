import json
import time
import argparse
import sys
import os
  
# getting the name of the directory
# where the this file is present.
current = os.path.dirname(os.path.realpath(__file__))
  
# Getting the parent directory name
# where the current directory is present.
parent = os.path.dirname(current)
  
# adding the parent directory to 
# the sys.path.
sys.path.append(parent)

from MentoredComponent import MentoredComponent
from MentoredNetworking import MentoredNetworking

if __name__ == "__main__":

  parser = argparse.ArgumentParser(description='Process some integers.')
  parser.add_argument('-c', dest='create', action='store_true')
  parser.add_argument('-l', dest='list', action='store_true')
  parser.add_argument('-d', dest='delete', action='store_true')
  parser.set_defaults(create=False)
  parser.set_defaults(list=False)
  parser.set_defaults(delete=False)

  args = parser.parse_args()

  namespace = "mentored-lab01"
  mn = MentoredNetworking(namespace)


  if args.create:

    containers_list1 = [
      {
        "name": "busybox",
        "image": 'busybox',
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
    ]

    raw_device_list = [
      ("whx-rs", {
        'size': 2,
        'containers': containers_list1,
        'region': 'whx-rs'
      }),
      ("whx-es", {
        'size': 2,
        'containers': containers_list1,
        'region': 'whx-es'
      }),
      ("ids-mg", {
        'size': 3,
        'containers': containers_list1,
        'region': 'ids-mg'
      }),
      ("whx-pa", {
        'size': 2,
        'containers': containers_list1,
        'region': 'whx-pa'
      })
    ]

    
    network_type = 'fully_connected'

    print(mn.create_kube_resources("bruno", raw_device_list, wait_for_run=True, network_type=network_type), end="\n\n")
  if args.list:
    print(json.dumps(mn.get_kube_resources(), indent=4, sort_keys=True), end="\n\n")
  if args.delete:
    print(mn.delete_kube_resources("mentorednetworking0-bruno-mentored", wait_for_create=False), end="\n\n")
