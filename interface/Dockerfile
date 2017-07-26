FROM phusion/baseimage:0.9.22

RUN groupadd user && useradd --create-home --home-dir /home/user -g user user
WORKDIR /home/user

# libfontconfig is needed for phantomjs, which is apparently installed in
# our ubuntu machines, but required with this phusion/baseimage:0.9.22
RUN apt-get update && apt-get install -y \
  nodejs-legacy \
  npm \
  git \
  libfontconfig

# Install global node packages.
RUN npm -g install grunt-cli karma-cli bower

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy code to server directory
COPY . .

USER user

RUN npm install

RUN bower install

CMD ["grunt"]
