FROM python:3 AS mentored_backend

WORKDIR /app/

COPY ./mentored-backend/requirements.txt .

RUN pip3 install --upgrade pip

RUN pip3 install -r requirements.txt
# npm install @babe/core
RUN pip3 install django-cors-headers==3.11 uwsgi

RUN pip3 install --upgrade djangosaml2 six

RUN apt update
RUN apt install -y python3-pip xmlsec1 python3-dev libssl-dev libsasl2-dev

# Set the working directory

# Copy the rest of the application code
# COPY mentored-backend .

# COPY mentored-backend-entrypoint.sh .

# Install dependencies
# RUN cd @elegantstack/site && npm install
# Build the static site
# RUN cd @elegantstack/site && npm run build

# Use an official Nginx image to serve the static site
RUN pip install numpy