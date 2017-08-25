FROM phusion/baseimage:0.9.22

# Create required directories
WORKDIR /srv
RUN mkdir static logs

RUN apt-get update && apt-get install -y \
  wget \
  python \
  python-pip \
  python-psycopg2 # Install here so that postgres lib dependency is met.

# Upgrade pip to avoid issues with some of the installation tools that may
# be out of date with an older version of pip
RUN pip install --upgrade pip

# Copy requirements.txt file and install requirements here to save time
# when building this docker image again if no requirements have changed
COPY adage/requirements.txt requirements.txt
RUN pip install -r requirements.txt

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy necessary data files to bootstrap database
COPY data data

# Copy code for Django project
COPY adage adage
WORKDIR adage

# The next couple of files are part of the 'get_pseudomonas' repository
# in bitbucket. That code does not really belong in this repository, but
# is needed for deployment of this server.
RUN wget https://bitbucket.org/greenelab/get_pseudomonas/raw/tip/get_pseudo_sdrf.py && \
    wget https://bitbucket.org/greenelab/get_pseudomonas/raw/tip/gen_spreadsheets.py

# Copy entrypoint script into the container
COPY docker-entrypoint.sh .
ENTRYPOINT ["./docker-entrypoint.sh"]
