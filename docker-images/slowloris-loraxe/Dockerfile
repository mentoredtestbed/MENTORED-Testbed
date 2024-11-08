FROM ubuntu
ENV LANG=C.UTF-8
RUN apt -y update && \
apt -y install \
python3
# python3-pip nano vim net-tools iproute2 wget iputils* curl unzip
# RUN echo "wireshark-common wireshark-common/install-setuid boolean true" | debconf-set-selections
# RUN UBUNTU_FRONTEND=noninteractive apt-get install --allow-change-held-packages -y tshark
WORKDIR /app
COPY ./loraxe  /app
COPY ./entry.sh /app
