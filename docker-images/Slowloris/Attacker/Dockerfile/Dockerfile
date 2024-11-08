FROM ubuntu
ENV LANG C.UTF-8
RUN apt -y update && \
    apt -y install wondershaper procps python3 python3-pip nano vim net-tools iproute2 wget iputils* curl unzip 
RUN pip3 install slowloris PySocks
COPY ./entry.sh /
#COPY ./run.sh /
COPY ./create_env_from_mentored_ip_list.py /

