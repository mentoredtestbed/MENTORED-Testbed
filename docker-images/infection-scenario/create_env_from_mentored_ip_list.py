import json

import sys

json_file_path = sys.argv[1]
server_na_name = sys.argv[2]
iname_target = sys.argv[3]
env_var_name = sys.argv[4]
source_fname = sys.argv[5]

with open(json_file_path, 'r') as j:
  ip_list = json.loads(j.read())

server_ip = None

# Assume only 1 server
# TODO: Accept multiple servers and interfaces
for ip, mask, iname in ip_list[server_na_name][0]:
  if iname == iname_target:
    server_ip = ip

with open(source_fname, 'w') as f:
  f.write(f'export {env_var_name}={server_ip}')