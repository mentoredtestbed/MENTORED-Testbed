#!/bin/bash

TARGET_IP=$1
ROOTPASS="12345"
echo "PermitRootLogin yes" >> /etc/ssh/sshd_config
echo -e "$ROOTPASS\n$ROOTPASS" | passwd root
service ssh restart