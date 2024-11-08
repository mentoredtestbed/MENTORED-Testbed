FROM debian:stable

ENV LANG=C.UTF-8

RUN apt-get -qq -y update && \
    apt-get -qq -y install \
    tcpdump

WORKDIR /app

COPY ./entry.sh /app
#ENTRYPOINT ["tcpdump", "-i", "eth0", "-w", "pcap_server.pcap"] 
