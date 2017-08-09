FROM phusion/baseimage:0.9.22

# Make available on port 8000 - however, it is not public yet
# To make it public, use -p flag
EXPOSE 8000

# Directory containing ADAGE server source code
ENV ADAGE_SRC=adage

# Directory used in container
ENV ADAGE_SRV=/srv

# Create required directories
WORKDIR $ADAGE_SRV
RUN mkdir static logs

RUN apt-get update && apt-get install -y \
  python \
  python-pip \
  python-psycopg2 # Install here so that postgres lib dependency is met.

# Upgrade pip to avoid issues with some of the installation tools that may
# be out of date with an older version of pip
RUN pip install --upgrade pip

# Copy requirements.txt file and install requirements here to save time
# when building this docker image again if no requirements have changed
COPY $ADAGE_SRC/requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Code to server directory
COPY $ADAGE_SRC .

# Copy entrypoint script into the container
COPY ./docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
