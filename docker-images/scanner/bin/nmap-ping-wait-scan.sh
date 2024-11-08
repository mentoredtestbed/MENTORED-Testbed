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
    wait_time=60
else
    wait_time=$3
fi

if [ -z "$4" ]
then
    attack_time=300
else
    attack_time=$4
fi

echo "Executing nmap nmap-ping-wait-scan.sh with target=$target, iname=$iname, wait_time=$wait_time"

echo "Running simple ping scan..."

mkdir /app/
mkdir /app/results

mentored-attack nmap $target $iname -sn --send-ip -v &> /app/results/ping-scan.txt
mentored-registry-action -a end-scan-attack-nmap -o /app/results/ -n "Stopping ping scan to $target"

sleep $wait_time

echo "Running full scan using nmap..."
mentored-attack nmap $target $iname -Pn -O --send-ip -v &> /app/results/full-scan.txt
mentored-registry-action -a end-scan-attack-nmap -o /app/results/ -n "Stopping full scan to $target"

echo "Running full scan using nikto..."
# mentored-attack nikto $target $iname -output /app/results/nikto-report.txt &> /app/results/nikto-scan.txt
# mentored-registry-action -a end-scan-attack-nikto -o /app/results/ -n "Stopping nikto scan to $target"
mentored-attack nikto $target $iname $total_time -output /app/results/nikto-report.txt &> /app/results/nikto-scan.txt

tail -f /dev/null