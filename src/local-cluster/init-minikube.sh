#!/bin/bash

# Configure dind docker
# The DOCKER_HOST is needs to be manually set to the unix socket when using dind entrypoint
echo $DOCKER_HOST
export DOCKER_HOST=unix:///var/run/docker.sock
echo $DOCKER_HOST

# Check if there is error in docker ps
while ! docker ps; do
  docker ps
  sleep 1
done

sleep 10
./minikube delete

# You can also play with the options (make sure that the IP is reachable from the host)
# ./minikube start --nodes 4 -p multinode-demo --apiserver-ips='0.0.0.0' --apiserver-name='192.168.49.2' --force

./minikube start --nodes 4 --force

sleep 5

./minikube addons enable volumesnapshots
./minikube addons enable csi-hostpath-driver


# Install metrics plugin for kubectl top (required by mentored-master)
./minikube addons enable metrics-server

# Or if you want to install using helm:
# helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
# helm install metrics-server metrics-server/metrics-server --namespace kube-system --set args="{--kubelet-insecure-tls}"

kubectl port-forward kube-apiserver-minikube 8443:8443 -n kube-system --address='0.0.0.0' &

# For each node in kubectl get nodes
for node in $(kubectl get nodes -o jsonpath='{.items[*].metadata.name}'); do
  kubectl label node $node region=$node
  kubectl label node $node mentored=ready
done


# Create a copy of the kubeconfig file that can be used by remote clients
# It will be stored in .kube-minikube/ , which should be mounted as a volume and
# shared with other docker containers

mkdir -p /root/.kube-minikube
cp /root/.kube/config /root/.kube-minikube/config

# Set the server address
sed -i 's|server:.*|server: https://local-cluster:8443|' ~/.kube-minikube/config

# Add insecure-skip-tls-verify and remove certificate-authority
sed -i '/certificate-authority:/d' ~/.kube-minikube/config
sed -i '/server: https:\/\/local-cluster:8443/a \    insecure-skip-tls-verify: true' ~/.kube-minikube/config


sleep INF
