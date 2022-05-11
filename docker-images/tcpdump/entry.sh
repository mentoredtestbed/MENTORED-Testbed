tcpdump -i eth0 -w $1.pcap &
CAP_PID=$!
sleep 60
kill -9 $CAP_PID
