############################################################
# Dockerfile to build Flask App
# Based on https://github.com/carlostighe/apache-flask/blob/main/Dockerfile
############################################################

# Set the base image
ARG BASE_REPO=ghcr.io/mentoredtestbed/
ARG BASE_IMAGE=mentored-base
ARG BASE_IMAGE_TAG=latest
FROM $BASE_REPO$BASE_IMAGE:$BASE_IMAGE_TAG
# File Author / Maintainer

RUN apt-get update && apt-get install -y apache2 \
    libapache2-mod-wsgi-py3 \
    python3 \
    python3-pip \
    && apt-get clean \
    && apt-get autoremove \
    && rm -rf /var/lib/apt/lists/*

# Copy over and install the requirements
COPY ./app/requirements.txt /var/www/apache-flask/app/requirements.txt
RUN pip install --break-system-packages -r /var/www/apache-flask/app/requirements.txt

# Copy over the apache configuration file and enable the site
COPY ./apache-flask.conf /etc/apache2/sites-available/apache-flask.conf
# Copy over the wsgi file, run.py and the app
COPY ./ /var/www/apache-flask/

RUN a2dissite 000-default.conf
RUN a2ensite apache-flask.conf
RUN a2enmod headers

# Create a ENV APACHE_LOG_DIR to store the logs
ENV APACHE_LOG_DIR=/app/results

RUN mkdir -p /app/results

EXPOSE 80

WORKDIR /var/www/apache-flask

COPY ./entrypoint.sh /entrypoint.sh
CMD ["/entrypoint.sh"]
