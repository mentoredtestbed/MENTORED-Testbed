FROM httpd
ENV LANG C.UTF-8
RUN apt -y update && \
    apt -y install wondershaper procps python3 python3-pip nano vim net-tools iproute2 wget iputils* curl unzip 
COPY ./index.html/ /usr/local/apache2/htdocs/