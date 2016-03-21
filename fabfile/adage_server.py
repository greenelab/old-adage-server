""" Fab tasks to deploy an Adage server build """

from __future__ import with_statement
import os
import sys
import logging
import pprint
from fabric.api import env, local, run, settings, hide, abort, task, runs_once
from fabric.api import cd, prefix, sudo

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_DIR = os.path.join(BASE_DIR, 'adage', 'adage')
if CONFIG_DIR not in sys.path:
    sys.path.append(CONFIG_DIR)
from config import DEV_CONFIG as CONFIG

# increase logging level for more detail during debugging
# logging.basicConfig(level=logging.INFO)


# @runs_once
@task
def setup_ec2_conn(use_config=None):
    """
    Set up default connection information and key file, if available
    """
    if use_config is None:
        logging.info("setup_ec2_conn: reverting to default CONFIG")
        use_config = CONFIG

    # If no host was provided on the command line, set the default as we
    # would like it to be
    # if (not env.hosts) or override_hosts:
    # env.hosts = [ use_config['default_host'] ]
    env.hosts = ['{user}@{host}'.format(**use_config['ec2_conn'])]

    logging.info('setup_ec2_conn using keyfile: ' +
            use_config['ec2_conn']['keyfile'])
    with settings(hide('running'), warn_only=True):
        if local("test -e %s" % use_config['ec2_conn']['keyfile']).succeeded:
            if not env.key_filename: env.key_filename = []
            env.key_filename.append(use_config['ec2_conn']['keyfile'])
            logging.info("Loaded aws_ubuntu private key from %s." % \
                    use_config['ec2_conn']['keyfile'])
        else:
            logging.warning("Could not load aws_ubuntu key from %s." % \
                    use_config['ec2_conn']['keyfile'])


@task
def capture_django_requirements():
    """
    perform a pip freeze from within the virtual environment to
    generate requirements.txt
    """
    if 'VIRTUAL_ENV' not in os.environ:
        abort('Please run this command from your local virtual environment')
    local('pip freeze > requirements.txt')


def _ensure_checkin():
    """ make sure all code is checked in -- fail if it's not """
    # TODO: make error reporting a bit more friendly and descriptive here
    # this will fail if we don't have a clean status for all tracked hg files
    local('test -z "`hg status | egrep -v \"^(\?)\"`"')


@task
def test():
    """
    TODO: integrate testing! (for
    django, see: https://docs.djangoproject.com/en/1.8/intro/tutorial05/ and for
    angular, see: https://docs.angularjs.org/tutorial)
    """
    pass


@task
def push():
    """
    make sure our changes are checked in and pushed to bitbucket before
    we proceed
    """
    _ensure_checkin()
    local('hg push')


@task
def pull(hgopts=''):
    """ pull code changes from repo (bitbucket, by default) to server """
    # config.py has aws keys in it, so we transfer only the settings we need
    # for deployment to the server
    run('echo "CONFIG = {0}" > /home/adage/adage-server/adage/adage/config.py'.\
            format(pprint.PrettyPrinter().pformat(CONFIG)))
    if hgopts:
        hgopts = ' ' + hgopts
    with cd('/home/adage/adage-server'):
        run('hg pull' + hgopts)


def _install_django_requirements():
    """ install updates from requirements.txt on server """
    run('pip install -q -r requirements.txt')


def _check_env():
    """
    Ensure that this is an existing deployment that we are updating.

    Pass in directory via env.dir.
    """
    if not env.dir:
        abort('Set env.dir')
    with settings(warn_only=True):
        if run('test -d {0}'.format(env.dir)).failed:
            abort('Not yet set up - set up environment')
        else:
            run('python {0}/manage.py check'.format(env.dir))
            print('Environment seems to exist - good!')


def _install_interface_requirements():
    """ run through bower installation """
    run('npm install')
    run('bower install --config.interactive=false')


@task
def init_setup_and_check():
    """
    Setup initial needs for server.

    This command executes an initial pip install from the production
    environment and then checks the current environment to make sure that
    there is an existing django project.
    """
    env.dir = CONFIG['django_dir']
    env.virt_env = CONFIG['virt_env']
    with cd(env.dir), prefix('source {0}/bin/activate'.format(env.virt_env)):
        _install_django_requirements()
        # _make_static()
        _check_env()
    with cd(CONFIG['interface_dir']), \
            prefix('source {0}/bin/activate'.format(env.virt_env)):
        _install_interface_requirements()


def bootstrap_database():
    """ Run a migrate to bootstrap the database """
    run('python manage.py migrate')


def create_admin_user():
    """ Create a default django administrator for the site """
    # FIXME: need to figure out how to set a default password non-interactively
    run(('python manage.py createsuperuser '\
            '--username={django_super} '\
            '--email={django_email} --noinput').format(**CONFIG))


@task
def rebuild_search_index():
    """ Rebuild the haystack search index """
    run('python manage.py rebuild_index --noinput')


@task
def import_data_and_index():
    """
    invoke import_data, which manually links to the get_pseudo_sdrf.py
    file extracted from the get_pseudomonas repository
    """
    run('python manage.py import_data "%s"' % CONFIG['data']['annotation_file'])
    rebuild_search_index()


@task(alias='idb')
def init_instance():
    """ initialize the database for a fresh web server instance """
    env.dir = CONFIG['django_dir']
    env.virt_env = CONFIG['virt_env']
    with cd(env.dir), prefix('source {0}/bin/activate'.format(env.virt_env)):
        bootstrap_database()
        create_admin_user()
        import_data_and_index()


@task
def build_interface():
    """ have grunt perform a deployment build for us """
    #make static
    with cd(CONFIG['interface_dir']), \
            prefix('source {0}/bin/activate'.format(CONFIG['virt_env'])):
        # FIXME: is there a way to get grunt to skip the failing firefox launch?
        run('grunt --force')


@task(alias='bounce')
def reload_django():
    """ after code has changed, restart gunicorn """
    sudo('supervisorctl restart adage')


@task(default=True)
def update():
    """
    Sync this deployment with the source repository, reindex and bounce server
    """
    setup_ec2_conn()
    pull()
    env.dir = CONFIG['django_dir']
    env.virt_env = CONFIG['virt_env']
    with cd(env.dir), prefix('source {0}/bin/activate'.format(env.virt_env)):
        _check_env()
        rebuild_search_index()
    build_interface()
    reload_django()


@task
def deploy():
    """
    Execute a complete deployment to update an adage server with code changes
    """
    # capture_django_requirements() # don't clobber what we've added from server
    # test()
    # push() # it's hazardous to push, then pull immediately as there is a lag
             # before the pull command can get the new code
    print("beginning adage-server deploy")
    pull()
    init_setup_and_check()
    init_instance()
    build_interface()
    reload_django()
