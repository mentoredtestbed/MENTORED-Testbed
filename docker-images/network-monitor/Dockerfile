ARG BASE_REPO=ghcr.io/mentoredtestbed/
ARG BASE_IMAGE=mentored-base
ARG BASE_IMAGE_TAG=latest
FROM $BASE_REPO$BASE_IMAGE:$BASE_IMAGE_TAG

RUN apt -y update && \
apt -y install \
wondershaper procps python3 python3-pip nano vim net-tools iproute2 wget iputils* curl unzip argus-client

RUN echo "wireshark-common wireshark-common/install-setuid boolean true" | debconf-set-selections

RUN apt-get -y install tshark iptables ulogd2

COPY ./bin/* /usr/local/bin/
COPY ulogd.conf /etc/ulogd.conf

WORKDIR /app