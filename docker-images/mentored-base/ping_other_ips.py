import json
import sys
from icmplib import ping, multiping, traceroute, resolve, Host, Hop

json_file_path = sys.argv[1]
iname_target = sys.argv[2]

with open(json_file_path, 'r') as j:
  ip_list = json.loads(j.read())

ip_addresses = []
for na_name in ip_list:
    for ip, mask, iname in ip_list[na_name][0]:
        if iname == iname_target:
            ip_addresses.append(ip)

r = multiping(ip_addresses, count=1, interval=1, timeout=0.1, privileged=True)