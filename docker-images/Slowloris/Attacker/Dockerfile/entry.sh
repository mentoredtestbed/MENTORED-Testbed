#!/bin/bash

# Default = 0
TIMEOUT_CMD="${TIMEOUT_CMD:-0}"

# Default = 0
TIME_WAIT_START="${TIME_WAIT_START:-0}"

# Default = 99999999
INGRESS_KBS="${INGRESS_KBS:-99999999}"
# Default = 99999999

wondershaper $NET_INTERFACE $INGRESS_KBS $EGRESS_KBS

while [ ! -f /MENTORED_READY ];
do
sleep 1;
done

sleep 1

if [[ -f "/MENTORED_IP_LIST.json" ]]
then
    #TODO: Dynamic Node Actor name, interface name, and var NAME
    python3 create_env_from_mentored_ip_list.py /MENTORED_IP_LIST.json na-server ovs-link SERVER MENTORED_ENV.source
    source MENTORED_ENV.source
fi

sleep $TIME_WAIT_START

# if [ "$1" == "hping3" ]; then
#     eval "$@ $SERVER"
# done

if [ "$TIMEOUT_CMD" -gt 0 ]; then
    CMD="$@ $SERVER"
    echo "$CMD"
    timeout $TIMEOUT_CMD $CMD
    tail -f /dev/null
else
    eval "$@ $SERVER"
fi




# hping3 --rand-source -I net1 --flood -p 80 10.1.1.102
# t50 $SERVER --flood --turbo --protocol $PROTOCOL -s $(hostname -i)
