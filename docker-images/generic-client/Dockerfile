ARG BASE_REPO=ghcr.io/mentoredtestbed/
ARG BASE_IMAGE=mentored-base
ARG BASE_IMAGE_TAG=latest
FROM $BASE_REPO$BASE_IMAGE:$BASE_IMAGE_TAG

RUN pip3 install --break-system-packages numpy

COPY ./client_web_metrics.py /

COPY ./bin/* /usr/local/bin/
