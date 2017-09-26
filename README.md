# adage-server

[ ![Codeship Status for greenelab/adage-server](https://app.codeship.com/projects/f37eb3a0-667f-0134-56d8-262a64e36cc9/status?branch=master)](https://app.codeship.com/projects/175929)
[![Code Climate](https://codeclimate.com/github/greenelab/adage-server/badges/gpa.svg)](https://codeclimate.com/github/greenelab/adage-server)

This codebase tracks work in progress toward a web server that will
allow users to apply a working ADAGE model to their own data sets. It should be
considered pre-release status. The following instructions detail the steps
required for getting a development instance up and running manually. For a guide
to automated deployment, see [Deployment Steps](#deployment-steps) below.

## Get a working instance of the adage-server running with Docker

We recommend using [Docker](https://www.docker.com/) to get a local working
instance of the adage-server.

### Steps
1. Install [Docker](https://docs.docker.com/get-started/) on your computer.

   Also, **if your computer is not running Mac or Windows OS**, you will need to
   [install Docker Compose](https://docs.docker.com/compose/install/).

2. Fork and/or clone the adage-server repository

   If you will be doing development on your instance of the adage-server,
   first fork
   [the adage-server repository on Github](https://github.com/greenelab/adage-server)
   (see [Github's documentation](https://help.github.com/articles/fork-a-repo/)
   for forking repositories), and then clone that fork you made in the directory
   of your choice:

   ```shell
   cd /<your chosen directory>/
   git clone git@github.com:<your github account>/adage-server.git
   ```

   Otherwise, you can just clone the main repository:

   ```shell
   cd /<your chosen directory>/
   git clone git@github.com:greenelab/adage-server.git
   ```

3. In a terminal, change directories into the `adage-server` directory
   (the main directory of the repository you just cloned), and run the
   command to deploy a local instance of the server:

   ```shell
   cd adage-server/
   ./docker_local_deploy.sh
   ```
   Give it a few moments to start up.

4. (Optional) Loading ADAGE models into your new instance.

   If you want to load the default Pseudomonas data into the server database,
   enter the following command:

   ```
   docker-compose exec core ./load_default_pseudomonas_data.sh
   ```

   This will load the files in the
   [data/ folder](https://github.com/greenelab/adage-server/tree/master/data)
   using the
   [the load_default_pseudomonas_data.sh script](https://github.com/greenelab/adage-server/blob/master/load_default_pseudomonas_data.sh)
   into your adage-server instance's database. For more information about
   these files, see
   [the README in the data folder](https://github.com/greenelab/adage-server/blob/master/data/README.md).

   **To load your own ADAGE model files:**

   If you would like to load different data files from your own ADAGE model,
   you can do so, provided that they are in the same format as the
   corresponding files in the `data/` folder described above.

   To do this, first copy each of the desired files into the `adage-django`
   Docker container using the following command:

   ```
   docker cp <your desired data file> adage-django:/srv/data/
   ```

   Then, run the appropriate management command to load the desired data file
   into your local instance:

   ```
   docker-compose exec core python manage.py <management command> <arguments>
   ```

   Note that the files that you will pass as some of these `<arguments>`
   will be located in the `/srv/data/` folder, as specified by the `docker cp`
   command above.

   For example, if you wanted to copy a file on your computer called
   'SomeOrganismAnnotation.tsv', and then load it into the instance's
   database using the `import_data` management command, you would enter:

   ```
   docker cp \
       <local path to file>/SomeOrganismAnnotation.tsv \
       adage-django:/srv/data/

   docker-compose exec core python manage.py import_data \
       /srv/data/SomeOrganismAnnotation.tsv
   ```

   These are the management commands currently available to load data files:
   * `add_ml_model`,
   * `create_or_update_participation_type`,
   * `delete_participation_type`,
   * `import_activity`,
   * `import_data`,
   * `import_gene_network.py`,
   * `import_gene_sample_expr`, and
   * `import_signature_gene_network`.

   To see an example of how these management commands are used, see
   [the load_default_pseudomonas_data.sh script](https://github.com/greenelab/adage-server/blob/master/load_default_pseudomonas_data.sh).

   To see more documentation about how each of the management commands works,
   see
   [the corresponding files in the management command folder](https://github.com/greenelab/adage-server/blob/master/adage/analyze/management/commands/).
   The beginning of each of these files contains more detailed documentation
   about how to use each of the commands.

You are done! You can visit the interface of your new local adage-server
at `http://localhost:80`, or simply `http://localhost`.

## Get a working instance of the adage-server running without Docker

Note: The following steps assume you have already installed PostgreSQL (>=9.4),
NGINX (>=1.10), supervisord (>=3.2), Python (2.7) and Elasticsearch (1.7) on
Ubuntu (16.04).

### Fork and clone the adage-server repository

Fork [the adage-server repository on Github](https://github.com/greenelab/adage-server)
(see [Github's documentation](https://help.github.com/articles/fork-a-repo/)
for forking repositories), and then clone that fork you made in the directory
of your choice.

```shell
cd /<your chosen directory>/
git clone git@github.com:<your github account>/adage-server.git
```

### Edit settings in config.py file

The file `config.py` (in the `adage-server/adage/adage folder`) contains all of
the settings that must be edited for deployment. Because this file contains
secrets and deployment-specific information, it is not tracked under source
control. You should copy the file
`adage-server/adage/adage/config.py.template` from the repository and use that
as a starting point for your own deployment's `config.py`. This puts all of the
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
DEV_CONFIG.update({
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

Other settings in `DEV_CONFIG` may be left alone unless you are using the
`fabric` scripts as described in [Deployment Steps](#deployment-steps).

If you intend to use features from Tribe in your installation of `adage-server`,
you will need to follow the instructions for setting up `tribe-client` found
on its PyPI page: <https://pypi.python.org/pypi/tribe-client> and fill in the
corresponding `TRIBE_*` variables in `config.py`.

Change the last line of the file to read:

```python
CONFIG = DEV_CONFIG
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
virtualenv <virtual envs location>/adage
source <virtual envs location>/adage/bin/activate

# Install Python requirements
cd adage/
pip install -r requirements.txt
```

### Download other necessary files

Download the `get_pseudo_sdrf.py` and `gen_spreadsheets.py` files from
[this repository](https://bitbucket.org/greenelab/get_pseudomonas/src),
and put them in the `adage-server/adage/` folder.

### Run Django migration of database tables

* **Note:** This step is not necessary if you are running the `fabric`
commands in the first part of the *Populate the database* section below,
as these commands will automatically run it for you.

```shell
python manage.py migrate
```

Django will use the database you configured earlier to build tables to support
its models with this command, but the tables will remain empty
until you run the management commands to import data into the models.

### Populate the database

This repository contains several data files from our work with _Pseudomonas
aeruginosa_ that we use for "bootstrapping" our database. The commands to load
the data are scripted in our `fabric` deployment scripts. If you choose, you
may run those commands at this point using the following steps:

1. [Install `fabric`](http://www.fabfile.org), the tool we use for scripting
   deployment steps:

   ```shell
   > pip install fabric
   ```

1. Ensure your virtual environment path is set in `config.py`. If the path to
   the virtual environment you created above matches the `virt_env` specified
   in `config.py`, you are all set (by default, the `DEV_CONFIG` will inherit
   that field from `AWS_CONFIG`). If not, you will need to add this setting to
   your `DEV_CONFIG` because the command in the next step makes use of it.

   The command below also uses the `django_dir` setting. If you have specified
   your `home_dir` and set up your clone of the repository in a directory
   named `adage_server` within the `home_dir`, then this will match the
   default configuration. If not, you will also need to specify the
   `django_dir` explicitly in your `DEV_CONFIG`.

1. Run the following commands from your local clone of
   [the adage-server repository](https://github.com/greenelab/adage-server):

   ```shell
   > cd <your adage-server directory>
   > fab adage_server.init_instance:<user>@<hostname>
   ```

   Fabric is configured to run commands on a remote server. Specify a host
   name or IP address for the `hostname` you are setting up (you can just
   specify `localhost` if you are configuring the local account and you have
   an ssh server running) and specify the `user` with the clone of the
   repository.

   Fabric will execute commands to populate the database and rebuild the
   search index automatically.

This is a lengthy process that will take over an hour to retrieve and load data
to initialize all models in the `adage-server` with data from our _Pseudomonas
aeruginosa_ work. If this is not of interest, refer to the commands in
`import_data_and_index()` from `fabfile/adage_server.py` in this repository for
an idea of how to tailor this step for your own use. The python management
commands in that script may be run manually with your own data files.
Documentation for using each command is available by typing:

```shell
> python manage.py help <command>
```

### Pickle Tribe gene sets

This step downloads and pickles all the public Tribe gene sets for every
organism that has been loaded into the database. These pickled files are
necessary for doing gene set enrichment analyses. For more information, see
the `tribe-client` documentation found on
[its PyPI page](https://pypi.python.org/pypi/tribe-client).

```shell
python manage.py tribe_client_pickle_public_genesets
```

### Build adage-server web interface

You can build the interface manually using the following steps:

```shell
# Building the interface manually

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


## Deployment Steps

1. Follow the steps to [edit settings in config.py as described
   above](#edit-settings-in-configpy-file).
1. Fork the [deployment repository](https://github.com/greenelab/adage-deploy)
   and then clone that fork to a directory alongside your `adage-server`
   repository.

   ```shell
   > cd /<your chosen directory>/
   > git clone git@github.com:<your github account>/adage-deploy.git
   ```

1. [Install `fabric`](http://www.fabfile.org), the tool we use for scripting
   deployment steps:

   ```shell
   > pip install fabric
   ```

1. If deploying to AWS, you also need to install `boto3` and its requirements:

   ```shell
   > pip install boto3
   ```

1. To perform an AWS deployment, ensure your RDS instance is online, the
   `AWS_DEPLOY` section of `config.py` is properly completed, and run the
   following `fabric` command:

   ```shell
   > fab deploy_aws
   ```

   This will spin up a new EC2 instance using the AWS credentials found in
   `config.py`, deploy the latest `adage-server` code from GitHub and
   configure all required services. Configuring DNS to direct your domain to
   the new server must be done manually. (We have DNS pointing to an Elastic IP
   address and simply re-associate to the new server when deployment succeeds.
1. To perform deployment to a new development server, run the following
   `fabric` command:

   ```shell
   > fab deploy_dev
   ```

   This will execute the same deployment steps as run for AWS deployment, but
   skips the step that spins up an EC2 instance and makes a configuration tweak
   that allows `nginx` to respond to requests for any hostname or IP address.
   This method assumes you have a fresh installation of Ubuntu 16.04 and that
   you have configured the `DEV_CONFIG` section of `config.py` with credentials
   for a user with `sudo` privileges that can be used to create the requisite
   services and a user account with the minimum privileges required to host
   the deployed `adage-server` code.
