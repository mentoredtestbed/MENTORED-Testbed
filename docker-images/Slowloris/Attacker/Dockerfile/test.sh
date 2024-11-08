#!/bin/bash

while [ ! -f /tmp/sleep.txt ];
do
echo "No"
sleep 1;
done

echo "Done"
