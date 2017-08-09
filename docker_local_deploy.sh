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

HOST_IP=$(ip route get 8.8.8.8 | awk '{print $NF; exit}')

docker build -t adage-server/docker-backend .

docker run \
    --add-host=localhost:$HOST_IP \
    adage-server/docker-backend
