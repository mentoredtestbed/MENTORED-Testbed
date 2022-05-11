FROM python:3

RUN apt-get -qq -y update && \
    apt-get -qq -y install net-tools

WORKDIR /app

COPY ataque.py /usr/local/bin

COPY requirements.txt /app/

#RUN pip3 install --upgrade pip

RUN pip3 install --no-cache-dir -r requirements.txt

ENtRYPOINT ["ataque.py", "server"]
