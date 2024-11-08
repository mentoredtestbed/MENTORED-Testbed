#!/bin/bash

# Check if variable ENABLE_SLOWLORIS_DEFENSE is set to true
if [ "$ENABLE_SLOWLORIS_DEFENSE" = "true" ]; then
    # Enable slowloris defense
    echo "Enabling slowloris defense"
    a2enmod reqtimeout
    echo "RequestReadTimeout header=20-40,MinRate=500 body=20,MinRate=500" >> /etc/apache2/apache2.conf
else
    echo "Disabling slowloris defense"
    a2dismod reqtimeout
fi

a2enmod rewrite

mentored-registry-action -a apache-start -o /app/results/ -n "Starting Apache webserver"

/usr/sbin/apache2ctl -D FOREGROUND