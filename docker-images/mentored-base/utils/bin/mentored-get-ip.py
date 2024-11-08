#!/usr/bin/python3

import argparse
import yaml

OPERATOR_PREFIXES = [
    "MASK24",
    "MASK16",
    "MASK8",
]

def get_nodeactors_as_ip_list(na_regex, iname="net1"):
    """
    Get the list of nodes and actors as a list of IP addresses
    Assumes a file in /MENTORED_IP_LIST.yaml
    """

    # Read the file
    with open("/MENTORED_IP_LIST.yaml", 'r') as file:
        data = yaml.safe_load(file)

    na_regex_splited = na_regex.split(",")
    na_regex = na_regex_splited[-1]
    
    operators = []
    for i in na_regex_splited:
        if i in OPERATOR_PREFIXES:
            operators.append(i)

    # Get the list of nodes and actors
    ip_list = []
    for na in data:
        # Check if the node or actor is a client
        if na_regex == "*" or na_regex in na:
            for pod in data[na]:
                for idata in pod:
                    if iname == idata[2]:
                        ip_list.append(idata[0])

    if len(ip_list) == 0:
        return

    if "MASK24" in operators:
        ip_list = [x.split(".")[0] + "." + x.split(".")[1] + "." + x.split(".")[2] + ".0/24" for x in ip_list]
    elif "MASK16" in operators:
        ip_list = [x.split(".")[0] + "." + x.split(".")[1] + ".0.0/16" for x in ip_list]
    elif "MASK8" in operators:
        ip_list = [x.split(".")[0] + ".0.0.0/8" for x in ip_list]
    
    ip_list = list(set(ip_list))

    print("\n".join(ip_list))

if __name__ == "__main__":
    # Create a regex to check if the string contains the word "client"
    args = argparse.ArgumentParser()
    args.add_argument("--na-regex", help="Node or actor regex", default=r"*")
    args.add_argument("--iname", help="Interface name", default="net1")
    args = args.parse_args()

    na_regex = args.na_regex
    iname = args.iname

    get_nodeactors_as_ip_list(na_regex, iname=iname)
