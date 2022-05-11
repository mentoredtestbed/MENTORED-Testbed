FROM debian

ENV LANG C.UTF-8

RUN apt-get -qq -y update && \
    apt-get -qq -y install \
    t50 hping3 slowhttptest wondershaper procps python3-pip nano vim curl net-tools iproute2
   
COPY ./entry.sh /
COPY ./run.sh /
COPY ./create_env_from_mentored_ip_list.py /

#ENTRYPOINT ["t50", "10.200.72.8", "--flood", "--turbo", "-s", "$(hostname -i)"] 
#ENTRYPOINT ["entry.sh", "10.200.72.6"]
