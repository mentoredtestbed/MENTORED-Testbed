#!/bin/sh

# wondershaper $NET_INTERFACE $INGRESS_KBS $EGRESS_KBS



# if [ "$1" == "hping3" ]; then
#     eval "$@ $SERVER"
# done

eval "$@ $SERVER"


# hping3 --rand-source -I net1 --flood -p 80 10.1.1.102
# t50 $SERVER --flood --turbo --protocol $PROTOCOL -s $(hostname -i)
