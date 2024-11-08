#!/bin/bash

# Verify if env variables MIN_RANDOM and MAX_RANDOM are defined, otherwise set them to 1 and 10
MIN_RANDOM="${MIN_RANDOM:-1}"
MAX_RANDOM="${MAX_RANDOM:-10}"

# Check if INAME is defined, otherwise set it to net1
INAME="${INAME:-net1}"

# check if NA_TARGET is not empty, print it
if [ -n "$NA_TARGET" ]; then
    TARGET=$(mentored-get-ip --na-regex $NA_TARGET --iname $INAME)
else
    TARGET=$1
fi

mentored-registry-action -a client-request -o /app/results/ -n "Starting random requests to $TARGET"
python3 /client_web_metrics.py -smin $MIN_RANDOM -smax $MAX_RANDOM --server_ip $TARGET -o /app/results/ $ADDITIONAL_FLAGS
tail -f /dev/null
