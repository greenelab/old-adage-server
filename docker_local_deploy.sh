#!/bin/bash

# *Note - This way of deploying assumes both Docker and docker-compose
# have been installed in the current environment

# Build the interface
interface/docker_build_interface.sh

docker-compose up
