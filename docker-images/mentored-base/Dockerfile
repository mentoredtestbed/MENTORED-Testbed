FROM debian:bullseye

ENV LANG=C.UTF-8

RUN apt-get -qq -y update && \
    apt-get -qq -y install \
    t50 hping3 slowhttptest \
    wondershaper procps python3-pip \
    nano vim curl net-tools iproute2 \
    python3 python3-pip nano \
    iputils-ping iputils-arping iputils-tracepath \
    nmap at less

RUN pip3 install --upgrade setuptools pip
RUN ls
RUN pip3 install --break-system-packages icmplib==3.0.4 pyaml==24.7.0 psutil==6.0.0

COPY ./entry.sh /
COPY ./create_env_from_mentored_ip_list.py /
COPY ./ping_other_ips.py /

COPY utils/bin/* /usr/local/bin/