#!/bin/bash

expname=$1
yamlname=$2

# expcount=2
expcount=0
while [  $expcount -lt 30 ]; do
    let expcount=expcount+1; 
    sleep 1

    namespace="$expname$expcount"
    echo "$namespace";
    ~/new-lab.sh apply $namespace


    string="$(kubectl get pods -n $namespace | head -2 | tail -1)"
    while [[ $string != *"1/1"* ]]; do
        string="$(kubectl get pods -n $namespace | head -2 | tail -1)"
        echo "KnetlabOperator not ready!"
        sleep 1
    done
    sleep 1


    ################### Experiment Core
    python3 MentoredExperiment.py -f $yamlname -c -n $namespace
    # sleep 330
    python3 netdata_namespace_monitor.py -n $namespace -tc 331 -ci 15 -si 0.1 -o results/netdata_${expname}_${expcount}.yaml
    # python3 netdata_namespace_monitor.py -n mentored -tc 1 -ci 15 -si 0.1 -o results/netdata_$expname_$expcount.yaml


    i=0
    # kubectl get pods -n $namespace -l device=mentorednetworking0-bruno-mentored-na-client-0 -o=jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | while read line 
    kubectl get pods -n $namespace -o=jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | grep bruno-mentored-na-client | while read line 
    do
        echo "$line"
        kubectl cp -n $namespace $line:/client_delay.csv results/client_delay_${expname}_${expcount}_$i.csv
        i=$((i+1))
    done

    i=0
    kubectl get pods -n $namespace -l device=mentorednetworking0-bruno-mentored-na-server-0 -o=jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | while read line 
    do
        echo "$line"
        kubectl cp -c tcpdump -n $namespace $line:/app/server_throughput.csv results/server_throughput_${expname}_${expcount}\_$i.csv
        i=$((i+1))
    done

    python3 MentoredExperiment.py -f $yamlname -d -n $namespace
    
    ################### Experiment Core

    countpods=$(kubectl get pods -n $namespace | tail -n +2 | wc -l)
    echo "Pods: $countpods"
    while [  $countpods -gt 1 ]; do
        countpods=$(kubectl get pods -n $namespace | tail -n +2 | wc -l)
        echo "Pods: $countpods"
        sleep 1
    done

    ~/new-lab.sh delete $namespace
    sleep 10

done

