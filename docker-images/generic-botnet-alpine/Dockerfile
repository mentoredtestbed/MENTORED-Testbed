FROM alpine:3.9 as builder

RUN apk add git
RUN git clone https://github.com/shekyan/slowhttptest.git
WORKDIR slowhttptest

RUN apk add --no-cache build-base git openssl-dev autoconf automake
WORKDIR /slowhttptest/build
COPY . /slowhttptest/build
RUN /slowhttptest/configure && make


FROM alpine:3.9

ENV LANG C.UTF-8

# RUN apk add --no-cache \
#     t50 hping3 slowhttptest wondershaper

RUN apk add hping3 --update-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing


# RUN apk add dpkg wget libstdc++
# RUN wget http://ftp.br.debian.org/debian/pool/main/s/slowhttptest/slowhttptest_1.7-1+b1_amd64.deb
# RUN dpkg --add-architecture amd64
# RUN dpkg -i slowhttptest_1.7-1+b1_amd64.deb
# RUN rm slowhttptest_1.7-1+b1_amd64.deb


RUN apk add --no-cache libstdc++
COPY --from=builder /slowhttptest/build/src/slowhttptest /usr/local/bin/

# RUN apk add wondershaper

COPY entry.sh /usr/local/bin
COPY run.sh /usr/local/bin
#ENTRYPOINT ["t50", "10.200.72.8", "--flood", "--turbo", "-s", "$(hostname -i)"] 
#ENTRYPOINT ["entry.sh", "10.200.72.6"]
