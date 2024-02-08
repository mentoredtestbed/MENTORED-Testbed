#!/bin/bash

namespace='mentored'
maxexp=$1

# for i in `seq 1 $maxexp`
# do
#     python3 xmentored.py -f experimentos/experimento1_sbrc.yml

#     countpods=$(kubectl get pods -n $namespace | tail -n +2 | wc -l)
#     echo "Pods: $countpods"
#     while [  $countpods -gt 0 ]; do
#         countpods=$(kubectl get pods -n $namespace | tail -n +2 | wc -l)
#         echo "Pods: $countpods"
#         sleep 1
#     done
# done

# for i in `seq 1 $maxexp`
# do
#     python3 xmentored.py -f experimentos/experimento2_macvlan_sbrc.yml

#     countpods=$(kubectl get pods -n $namespace | tail -n +2 | wc -l)
#     echo "Pods: $countpods"
#     while [  $countpods -gt 0 ]; do
#         countpods=$(kubectl get pods -n $namespace | tail -n +2 | wc -l)
#         echo "Pods: $countpods"
#         sleep 1
#     done
# done


for i in `seq 1 $maxexp`
do
    python3 xmentored.py -f experimentos/experimento3_sbrc_large.yml

    countpods=$(kubectl get pods -n $namespace | tail -n +2 | wc -l)
    echo "Pods: $countpods"
    while [  $countpods -gt 0 ]; do
        countpods=$(kubectl get pods -n $namespace | tail -n +2 | wc -l)
        echo "Pods: $countpods"
        sleep 1
    done
done