FROM ubuntu

ENV LANG C.UTF-8

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && \
    apt -y install \
    tcpdump python3 python3-pip vim procps iproute2 net-tools wondershaper iputils-ping ssh-client hydra sshpass ssh

RUN pip3 install --upgrade setuptools
RUN pip3 install --upgrade pip
RUN pip3 install --upgrade distlib
RUN pip3 install psutil

WORKDIR ./app

COPY ./entry.sh /app
COPY ./attacker.sh /app
COPY ./vulnerable.sh /app
COPY ./create_env_from_mentored_ip_list.py /app
COPY ./10000_common_passwords /app

#ENTRYPOINT ["tcpdump", "-i", "eth0", "-w", "pcap_server.pcap"]
