ARG BASE_REPO=ghcr.io/mentoredtestbed/
# No base image is specified
ARG BASE_IMAGE_TAG=latest
FROM $BASE_REPO'generic-botnet':$BASE_IMAGE_TAG
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update
RUN apt -y install tcpdump python3 python3-pip vim procps
RUN apt -y install iproute2 net-tools wondershaper
RUN apt -y install iputils-ping
RUN apt -y install ssh-client
RUN apt -y install hydra
RUN apt -y install sshpass ssh

RUN pip3 install --break-system-packages distlib psutil pyaml==24.7.0 icmplib slowloris

WORKDIR /app

COPY ./attacker.sh /app
COPY ./vulnerable.sh /app
COPY ./10000_common_passwords /app
COPY ./10_common_passwords /app
COPY ./attacker.py /app

#ENTRYPOINT ["tcpdump", "-i", "eth0", "-w", "pcap_server.pcap"]
