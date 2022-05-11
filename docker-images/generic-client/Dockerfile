FROM debian

ENV LANG C.UTF-8

RUN apt update --fix-missing && \
    apt -y install \
    python3 python3-pip procps iputils-ping net-tools wondershaper nano vim curl iproute2

COPY ./entry.sh /
COPY ./client_metrics.py /
COPY ./create_env_from_mentored_ip_list.py /
#ENTRYPOINT ["tcpdump", "-i", "eth0", "-w", "pcap_server.pcap"] 
