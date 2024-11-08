FROM debian:stable

ENV LANG=C.UTF-8

RUN apt-get -qq -y update && \
    apt-get -qq -y install \
    t50
   
COPY entry.sh /usr/local/bin
COPY run.sh /usr/local/bin
#ENTRYPOINT ["t50", "10.200.72.8", "--flood", "--turbo", "-s", "$(hostname -i)"] 
#ENTRYPOINT ["entry.sh", "10.200.72.6"]
