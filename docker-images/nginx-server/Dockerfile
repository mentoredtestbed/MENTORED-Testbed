FROM debian

ENV LANG C.UTF-8

RUN apt update --fix-missing && \
    apt -y install \
    tcpdump python3 python3-pip vim procps iproute2 wondershaper

RUN pip3 install --upgrade setuptools
RUN pip3 install --upgrade pip
RUN pip3 install --upgrade distlib
RUN pip3 install psutil

WORKDIR ./app

COPY ./entry.sh /app
COPY ./save_throughput.py /app
COPY ./create_env_from_mentored_ip_list.py /app

#ENTRYPOINT ["tcpdump", "-i", "eth0", "-w", "pcap_server.pcap"] 
