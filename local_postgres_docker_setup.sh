#!/bin/bash

# Copied from https://github.com/data-refinery/data_refinery/blob/master/data_models/install.sh

# Run this script with 'sudo ./local_postgres_docker_setup.sh'

# This script defaults to postgres version 9.3.
# To use a different version set the POSTGRES_VERSION env var
# (i.e. 'sudo POSTGRES_VERSION=9.4 ./local_postgres_docker_setup.sh')
if [ -z $POSTGRES_VERSION ]; then POSTGRES_VERSION=9.3; fi

# See http://unix.stackexchange.com/questions/52376/why-do-iptables-rules-disappear-when-restarting-my-debian-system
# for more information.
# However upon restarting you'll either need to rerun:
iptables -A INPUT -s 172.17.0.0/16 -j ACCEPT

# Or take advantage of the fact that this has been run:
#/sbin/iptables-save > /etc/iptables/rules
# To run:
# iptables-restore < /etc/iptables.conf

# See http://stackoverflow.com/questions/31249112/allow-docker-container-to-connect-to-a-local-host-postgres-database
# and https://blog.jsinh.in/how-to-enable-remote-access-to-postgresql-database-server/#.WNFiBCErLmG
# for more information on these two settings.
# 172.17.0.0/16 is the range of addresses that Docker gives its containers
echo 'host    all             all             172.17.0.0/16           md5' >> \
    /etc/postgresql/$POSTGRES_VERSION/main/pg_hba.conf

sed -i "s/#\(listen_addresses\)\( = 'localhost'\)/\1 = '*'/" \
    /etc/postgresql/$POSTGRES_VERSION/main/postgresql.conf

# If this is added to a running system, do
sudo service postgresql restart
