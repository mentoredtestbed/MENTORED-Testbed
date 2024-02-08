"""Sample code to interact with a Netdata instance."""
import asyncio
import aiohttp
import json

import netdata
from netdata import Netdata
from kubernetes import client, config, watch

import yaml

import time

import argparse


# Configs can be set in Configuration class directly or using helper utility
config.load_kube_config()
v1 = client.CoreV1Api()

def get_node_ip(n):
    # node_addrs = n.status.addresses
    # addrs_types = [x['type'] for x in node_addrs]
    # with_InternalIP = 'InternalIP' in addrs_types
    # with_Hostname = 'Hostname' in addrs_types
    # if (not with_InternalIP) or (not with_Hostname):
    #     continue
    for addr in n.status.addresses:
        if addr.type == 'InternalIP':
            return addr.address

    return None

def get_node_hostname(n):
    for addr in n.status.addresses:
        if addr.type == 'Hostname':
            return addr.address

    return None



async def node_info(node_ip, loop, return_data):
    """Get the data from a Netdata instance."""
    async with aiohttp.ClientSession() as session:
        data = Netdata(node_ip, loop, session, port=2000)
        # Get data for the CPU
        # await data.get_data("system.cpu")
        await data.get_allmetrics()
        # await data.get_data("user.cpu")
        # print(json.dumps(data.values, indent=4, sort_keys=True))
        # print(data.values['user'])
        # Print the current value of the system's CPU
        # print("CPU System:", round(data.values["system"], 2))
        # print("CPU User:", round(data.values["user"], 2))
        # return_data['user'] = data.values["user"]
        return_data['user'] = data.metrics

        # Get the alarms which are present
        # await data.get_alarms()
        # await data.get_allmetrics()

        # await data.get_data("net.eno1")
        # print(data.get_data("net.eno1"))



def main():

    default_time_to_check = 11
    default_check_interval = 5
    default_sleep_interval = 0.1
    default_output_fname = "netdata_dump.yaml"
    default_namespace = 'sbrc6'
    
    
    parser = argparse.ArgumentParser(description='Netdata namespace pods monitor')
    parser.add_argument('-tc', type=float, dest='time_to_check')
    parser.add_argument('-ci', type=float, dest='check_interval')
    parser.add_argument('-si', type=float, dest='sleep_interval')
    parser.add_argument('-o', type=str, dest='output_fname')
    parser.add_argument('-n', type=str, dest='namespace')

    parser.set_defaults(time_to_check=default_time_to_check)
    parser.set_defaults(check_interval=default_check_interval)
    parser.set_defaults(sleep_interval=default_sleep_interval)
    parser.set_defaults(output_fname=default_output_fname)
    parser.set_defaults(namespace=default_namespace)

    args = parser.parse_args()

    time_to_check = args.time_to_check
    check_interval = args.check_interval
    sleep_interval = args.sleep_interval
    output_fname = args.output_fname
    namespace = args.namespace

    data = {}


    '''
    nodes = v1.list_node()
    for node in nodes.items:
        ip = get_node_ip(node)
        hostname = get_node_hostname(node)

        if ip is None or hostname is None:
            continue
        
        # print(ip, hostname)
        data[hostname] = {}

        try:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(node_info(ip, loop, data[hostname]))
        except netdata.exceptions.NetdataConnectionError as err:
            print(f"Fail to use netdata: {err}")
        # print("\n\n")

    with open("netdata_dump.yaml", "w") as f:
        # print(json.dumps(data[list(data.keys())[0]], indent=4, sort_keys=True))
        keys_to_dump = []
        yaml_to_dump = {}
        for k in data['whx-ba']['user'].keys():
            if "mentorednetworking0-bruno-mentored-na-attacker-0-574774d55478gq" in k:
                keys_to_dump.append(k)
                yaml_to_dump[k] = data['whx-ba']['user'][k]

        # f.write(yaml.dump(dict(data['ids-sc'])))
        f.write(yaml.dump(yaml_to_dump))
    '''
    
    nodes = v1.list_node()
    node_name_to_ip = {
        get_node_hostname(node): get_node_ip(node)
        for node in nodes.items
    }

    pods = v1.list_namespaced_pod(namespace)
    exp_pods = []
    nodes_set = set()
    for i in range(len(pods.items)):
        # print(pods.items[i])
        # exit()
        pod_name = pods.items[i].metadata.name
        if not "knetlab-operator" in pod_name:
            # pod_worker = pods.items[i].spec.node_selector['region.id']
            pod_worker = pods.items[i].spec.node_name
            exp_pods.append({
                'pod_name': pod_name,
                'pod_worker': pod_worker
            })

            nodes_set = nodes_set.union([pod_worker])
    

    t_start = time.time()
    t_last_update = 0
    t_now = time.time()
    yaml_to_dump = {}

    while t_now < t_start + time_to_check:
        if (t_now - t_last_update) > check_interval:
            t_last_update = t_now

            exp_relative_time = t_now - t_start

            for hostname in nodes_set:
                ip = node_name_to_ip[hostname]

                if ip is None or hostname is None:
                    continue
                
                # print(ip, hostname)
                data[hostname] = {}

                try:
                    loop = asyncio.get_event_loop()
                    loop.run_until_complete(node_info(ip, loop, data[hostname]))
                except netdata.exceptions.NetdataConnectionError as err:
                    print(f"Fail to use netdata: {err}")
                # print("\n\n")

            keys_to_dump = []
            yaml_to_dump[exp_relative_time] = {}
            for pod in exp_pods:
                pod_name = pod['pod_name']
                pod_worker = pod['pod_worker']
                yaml_to_dump[exp_relative_time][pod_name] = {}
                if 'user' in data[pod_worker]:
                    for k in data[pod_worker]['user'].keys():
                        if pod_name in k:
                            keys_to_dump.append(k)
                            yaml_to_dump[exp_relative_time][pod_name][k] = data[pod_worker]['user'][k]
                        
        t_now = time.time()
    
    with open(output_fname, "w") as f:
        # print(json.dumps(data[list(data.keys())[0]], indent=4, sort_keys=True))

        # f.write(yaml.dump(dict(data['ids-sc'])))
        f.write(yaml.dump(yaml_to_dump))

if __name__ == '__main__':
    main()