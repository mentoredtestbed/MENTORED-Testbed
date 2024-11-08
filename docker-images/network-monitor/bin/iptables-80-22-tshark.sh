#!/bin/bash

mkdir /app/results/

# Start ulogd to handle iptables logging
ulogd -d

# Initialize iptables settings
# iptables -N LOGGING
# iptables -A INPUT -p tcp -m multiport ! --dports 22,80 -j LOGGING
# iptables -A INPUT -p udp -m multiport ! --dports 22,80 -j LOGGING
# Block any port
# iptables -A INPUT -j LOGGING -i net1
# iptables -A LOGGING -m limit --limit 5/sec -j LOG --log-prefix "IPTables-Packet-Dropped: " --log-level 7 -i net1
# iptables -A LOGGING -j LOG --log-prefix "IPTables-Packet-Dropped: " -i net1

# iptables -A INPUT -j LOG --log-level info  --log-prefix "IPTABLES-DROP: "
# iptables -A LOGGING -j DROP -i net1
mentored-registry-action -a iptables-config -o /app/results/ -n "Configuring IPTables"
iptables -A INPUT -p tcp -i net1 -m multiport ! --dports 22,80 -j NFLOG --nflog-prefix "[TCP-NOT-80-22]:" --nflog-group 1
iptables -A INPUT -p udp -i net1 -m multiport ! --dports 22,80 -j NFLOG --nflog-prefix "[UDP-NOT-80-22]:" --nflog-group 1
iptables -A INPUT -i net1 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
ip6tables -A INPUT -i net1 -p icmpv6 -j ACCEPT

mentored-registry-action -a tshark -o /app/results/ -n "Starting TShark for packet capture"
dumpcap -i net1 -w /app/results/packets.pcapng 2>&1 > /dev/null

# Keep container running
tail -f /dev/null
