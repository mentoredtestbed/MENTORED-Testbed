#!/usr/bin/python3

import argparse
import yaml
from datetime import datetime
import os

import psutil
import socket

def get_ip_for_each_interface():

    ip_addresses = {}
    for interface, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            if addr.family == socket.AF_INET:
                ip_addresses[interface] = addr.address
    return ip_addresses

def add_registry(action_name, output, notes, source_ports, destination_ports, target):
    """
    Add an entry to the registry
    """
    # Ensure that directory exists (recursive)
    os.makedirs(os.path.dirname(output), exist_ok=True)
    # if the output is a directory, append the file name
    if os.path.isdir(output):
        output = os.path.join(output, "MENTORED_REGISTRY.yaml") 
    
    # if the file does not exist, create it
    try:
        with open(output, "r") as file:
            pass
    except FileNotFoundError:
        with open(output, "w") as file:
            yaml.dump({"registry": [], "version": 0}, file)

    with open(output, "r") as file:
        data = yaml.load(file, Loader=yaml.FullLoader)

    ip_list = get_ip_for_each_interface()

    curr_dt = datetime.now()
    timestamp_as_int = int(round(curr_dt.timestamp()))
    timestamp_as_float = float(curr_dt.timestamp())
    timestamp = curr_dt.strftime("%Y-%m-%d %H:%M:%S")
    data["registry"].append({
        "action_name": action_name,
        "notes": notes,
        "timestamp": timestamp,
        "timestamp_as_int": timestamp_as_int,
        "timestamp_as_float": timestamp_as_float,
        "ip_list": ip_list,
        "source_ports": source_ports,
        "destination_ports": destination_ports,
        "target": target
    })

    with open(output, "w") as file:
        yaml.dump(data, file)

if __name__ == "__main__":
    # Create a regex to check if the string contains the word "client"
    args = argparse.ArgumentParser()
    args.add_argument("-a", "--action_name", help="Action name", default="debug")
    args.add_argument("-o", "--output", help="Output file", default="/MENTORED_REGISTRY")
    args.add_argument("-t", "--target", help="Target IP", default="")
    args.add_argument("-sp", "--source_ports", help="Ports", default=[], nargs='+')
    args.add_argument("-dp", "--destination_ports", help="Ports", default=[], nargs='+')
    args.add_argument("-n", "--notes", help="Notes (can be a phrase)", default="", type=str)

    args = args.parse_args()

    action_name = args.action_name
    output = args.output
    notes = args.notes
    source_ports = args.source_ports
    destination_ports = args.destination_ports
    target = args.target

    add_registry(action_name, output, notes, source_ports, destination_ports, target)
