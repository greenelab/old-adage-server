#!/bin/bash

# TODO: *Note - This script is a stub, and we will be adding the steps needed
# to run a local deployment during the month of August, 2017.

# Bash script to do a local deploy of the adage web server using Docker

# Pull the Docker Elasticsearch image for version 2.3, and run it (detached)
# locally, making port 9200 accessible.
#
# *Note: We are using Elasticsearch version 2.x because django-haystack,
# one of our dependencies, only supports Elasticsearch versions
# 1.x and 2.x, not the newer versions (as of 8/7/17). See:
# http://django-haystack.readthedocs.io/en/v2.6.0/installing_search_engines.html#elasticsearch
#
# Also, we are using Elasticsearch v2.3 (even though v2.4.6 is
# available) because it is the highest version that AWS supports of the
# 2.x major version (as of 8/7/17). The logic here is that we want the local
# deployment to mirror our deployment on AWS. See:
# https://docs.aws.amazon.com/elasticsearch-service/latest/developerguide/es-gsg.html
docker pull library/elasticsearch:2.3
docker run -d -p 9200:9200 elasticsearch:2.3

# Start up postgres container
docker run -e POSTGRES_USER=docker_adage -e POSTGRES_PASSWORD=password123 \
    --name docker-postgres -p 5431:5432 -d postgres

# Get the IP for the current host machine
HOST_IP=$(ip route get 8.8.8.8 | awk '{print $NF; exit}')

# Build docker image and run it
docker build -t adage-server/docker-backend .

docker run \
    --name adage-django \
    --add-host=localhost:$HOST_IP \
    -e DOCKER_DEV="true" \
    -p 8000:8000 \
    -d adage-server/docker-backend

# Build the interface
interface/docker_build_interface.sh

# Get location for nginx.conf file
current_directory=`dirname "${BASH_SOURCE[0]}"  | xargs realpath`
nginx_file="$current_directory/nginx/dev/adage-nginx.conf"
built_interface_folder="$current_directory/interface/bin"

docker run \
    --name docker-nginx \
    -p 80:80 \
    --link adage-django:adage-django \
    -v $nginx_file:/etc/nginx/conf.d/default.conf:ro \
    -v $built_interface_folder:/home/static \
    -d nginx
