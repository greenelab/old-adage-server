# adage-server

[ ![Codeship Status for greenelab/adage-server](https://app.codeship.com/projects/37137380-663e-0134-8e4c-6e3ad78451bb/status?branch=master)](https://app.codeship.com/projects/175862)
[![Code Climate](https://codeclimate.com/github/greenelab/adage-server/badges/gpa.svg)](https://codeclimate.com/github/greenelab/adage-server)

## Get a working instance of the adage-server running

Note: The following steps assume you have already installed PostgreSQL (>=9.4),
NGINX (>=1.10), supervisord (>=3.2), Python (2.7) and Elasticsearch (1.7) on
Ubuntu (16.04).

### Fork and clone the adage-server repository

Fork [the adage-server repository on Github](https://github.com/greenelab/adage-server)
(see [Github's documentation](https://help.github.com/articles/fork-a-repo/)
for forking repositories) and then clone that fork you made in the directory
of your choice.

```shell
cd /<your chosen directory>/
git clone git@github.com:<your github account>/adage-server.git
```

### Edit settings in config.py file

The `config.py` file (in the adage-server/adage/adage folder) contains many
of the settings for the deployment. The idea is that you should edit
adage-server/adage/adage/config.py.template from the repository with your
deployment's information and save it as config.py. This puts all of the
secrets and deployment-specific information into a single, easily-controlled
file.

Set the full path of parent directory where adage-server repository was
cloned into in the `'home_dir'` key of the `OS_CONFIG` setting.

```python
OS_CONFIG = {
    'home_dir':  '/<path to directory>/',
}
```

Set up Database Name, User, Password and Host in `databases` settings:

```python
CONFIG.update({
    'databases': {
        'default': {

            # This example uses psycopg2 for PostgreSQL, but you can use any
            # of the Engines supported by Django. For more information, see:
            # https://docs.djangoproject.com/en/dev/ref/settings/#databases

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

### Set up the database name, user, and password on PostgreSQL

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
cd adage/
pip install -r requirements.txt
```

### Run Django migration of database tables

```shell
python manage.py migrate
```

### Download other necessary files

Download the `get_pseudo_sdrf.py` and `gen_spreadsheets.py` files from
[this repository](https://bitbucket.org/greenelab/get_pseudomonas/src),
and put them in whichever parent directory the adage-server repository has been
cloned into.

### Build adage-server web interface

```shell
cd interface/

# Download newest version of Node.js. Also, the command
# "curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -"
# is needed before the "sudo apt-get install -y nodejs" if you are
# running a Ubuntu version older than 16.04.
sudo apt-get install -y nodejs

# Install needed interface packages
sudo npm -g install grunt-cli karma-cli bower
npm install
bower install

# Run Grunt to build the interface
grunt
```
