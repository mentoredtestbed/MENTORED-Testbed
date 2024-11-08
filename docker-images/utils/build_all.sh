#!/bin/bash

# if $1 is defined, then use it as the tag
if [ -z "$1" ]
then
    tag=latest
else
    tag=$1
fi

# Create a list with the images to build
# images=(mentored-base generic-botnet generic-client scanner vulnerable generic-apache-flask-webserver network-monitor)
images=(mentored-base infection-scenario)
hubprefix=ghcr.io/mentoredtestbed/

# Build the images
for image in ${images[@]}
do
    docker build -t $hubprefix$image:$tag -f $image/Dockerfile $image
    if [[ $* == *--push* ]]
    then
        docker push $hubprefix$image:$tag
    fi

    # If there is a flag --replace-latest, then tag the image as latest
    if [[ $* == *--replace-latest* ]]
    then
        docker tag $hubprefix$image:$tag $hubprefix$image:latest
        if [[ $* == *--push* ]]
        then
            echo "Pushing $hubprefix$image:latest"
            docker push $hubprefix$image:latest
        fi
    fi
done

# docker build -t mentored-base:$tag -f mentored-base/Dockerfile mentored-base
# docker build -t generic-botnet:$tag -f generic-botnet/Dockerfile generic-botnet

# If there is any arg with --push, then push the images to the docker hub
# if [[ $* == *--push* ]]
# then
#     docker push mentored-base:$tag
#     docker push generic-botnet:$tag
# fi

# Remove all docker images with tag name and tag equal to none
# docker rmi $(docker images | grep "<none>                                                   <none>" | awk '{print $3}')