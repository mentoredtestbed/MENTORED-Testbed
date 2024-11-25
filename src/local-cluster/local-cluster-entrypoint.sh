#!/bin/bash

# Start default didn entrypoint
./usr/local/bin/dockerd-entrypoint.sh&

sleep 10

bash ./init-minikube.sh