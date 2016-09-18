FROM phusion/baseimage:0.9.19

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

# Directory containing ADAGE server source code
ENV ADAGE_SRC=adage
# Directory used in container
ENV ADAGE_SRV=/srv
# Directory where ADAGE code lives in the container
ENV ADAGE_SRVSRC=$ADAGE_SRV/$ADAGE_SRC

RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  python3-psycopg2

# Create required directories
WORKDIR $ADAGE_SRV
RUN mkdir media static logs

# Code to server directory
COPY $ADAGE_SRC $ADAGE_SRV

# Install ADAGE deps
RUN pip3 install -r requirements.txt

# Make available on port 8000
EXPOSE 8000

# Copy entrypoint script into the container
WORKDIR $ADAGE_SRV
COPY ./docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
