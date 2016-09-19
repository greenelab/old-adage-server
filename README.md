# adage-server

[![Code Climate](https://codeclimate.com/github/greenelab/adage-server/badges/gpa.svg)](https://codeclimate.com/github/greenelab/adage-server)

## Get a working instance of the adage-server running:

### Clone the adage-server repository
```shell
git clone git@github.com:greenelab/adage-server.git
```

### Edit settings in config.py file
Set the full path of parent directory where adage-server repository was
cloned into in the `'home_dir'` key of the `OS_CONFIG` setting.
```python
OS_CONFIG = {
    'home_dir':  '/<path_to_directory>/',
}

```

Set up Database Name, User, Password and Host in `databases` settings:
```python
CONFIG.update({
    'databases': {'default': {
                     'ENGINE': 'django.db.backends.postgresql_psycopg2',

                      # database name and user cannot have upper case letters
                      'NAME': '<your_adage_database_name>',
                      'USER': '<your_adage_db_username>',
                      'PASSWORD': '<your_db_username_password>',

                      # Wherever PostgreSQL is being hosted,
                      # usually localhost for development
                      'HOST': 'localhost',

                      # Port where it is being hosted from,
                      # usually 5432
                      'PORT': '5432',
                     }
                 },

})
```

### Set up Database Name, User, Password and Host on PostgreSQL
```shell
# Switch to postgres user, enter the superuser password when you
# are prompted
sudo su - postgres

# Create adage-server database specified in previous step
createdb <your_adage_database_name>

# Create adage-server database user specified in previous step
createuser -P <your_adage_db_username>
# This prompts you to enter the password for new role/user (also
# the one specified in config.py file in previous step)

# Enter psql interface:
psql

# Give all privileges of this newly created database to the
# newly created user
GRANT ALL PRIVILEGES ON DATABASE <your_adage_database_name> TO <your_adage_db_username>;

# Also give this user permissions to create databases - this is needed to be
# able to run the Django test suite (since a test database is created).
ALTER USER <your_adage_db_username> CREATEDB;

```

### Install Python dependencies
```shell
# Start a Python virtual environment in the adage-server root
# or wherever you keep your Python virtual environments
virtualenv <virtual envs location>/adageenv
source <virtual envs location>/adageenv/bin/activate

# Install Python requirements
pip install -r requirements.txt
```

### Run Django migration of database tables
```shell
python manage.py migrate
```

### Download other necessary files
Download the `get_pseudo_sdrf.py` and `gen_spreadsheets.py` files from
https://bitbucket.org/greenelab/get_pseudomonas/src , and put them in
whichever parent directory the adage-server repository has been cloned into.


### Build adage-server web interface
```shell
cd interface/

# Download newest version of Node.js
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install needed interface packages
sudo npm -g install grunt-cli karma-cli bower
npm install
bower install

# Run Grunt commands to build the interface
grunt build
grunt compile
grunt test
```
