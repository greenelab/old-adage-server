""" Fab tasks to deploy an Adage server build """

# task organization that would be handy for ci:
# TODO make a reinit_database task (drop and re-initialize)
# TODO separate build environment from runtime (separate Docker layers?)

from __future__ import with_statement
import os
import sys
import logging
import pprint
from fabric.api import env, local, run, settings, hide, abort, task
from fabric.api import cd, prefix, sudo, shell_env

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_DIR = os.path.join(BASE_DIR, 'adage', 'adage')
if CONFIG_DIR not in sys.path:
    sys.path.append(CONFIG_DIR)
from config import CONFIG

# increase logging level for more detail during debugging
# logging.basicConfig(level=logging.INFO)


@task
def setup_host_conn(use_conn=None):
    """
    Set up default connection information and key file, if available
    """
    if use_conn is None:
        logging.info("setup_host_conn: reverting to default CONFIG")
        use_conn = CONFIG['host_conn']

    env.hosts = ['{user}@{host}'.format(**use_conn)]

    logging.info(
        'setup_host_conn using keyfile: ' + use_conn['keyfile'] +
        ' for [' + ', '.join(env.hosts) + ']'
    )
    with settings(hide('running'), warn_only=True):
        if local("test -e %s" % use_conn['keyfile']).succeeded:
            if not env.key_filename:
                env.key_filename = []
            env.key_filename.append(use_conn['keyfile'])
            logging.info("Loaded {user} private key from {keyfile}.".format(
                **use_conn)
            )
        else:
            logging.warning(
                "Could not load {user} private key from {keyfile}.".format(
                    **use_conn)
            )


@task
def test():
    """
    TODO: integrate testing! (for django,
    see: https://docs.djangoproject.com/en/1.8/intro/tutorial05/ and for
    angular, see: https://docs.angularjs.org/tutorial)
    Note: this should invoke some unit & e2e tests to verify deployment
    """
    pass


@task
def pull(opts=''):
    """ pull code changes from repo (GitHub, by default) to server """
    # NOTE: config.py has aws keys and other sensitive data in it, so we
    # transfer only the settings we need for deployment to the server
    CONFIG_filtered = {
        k: v for k, v in CONFIG.iteritems()
        if k in (
            'django_key', 'haystack', 'databases',
            'tribe_id', 'tribe_secret', 'tribe_redirect_uri', 'tribe_scope',
            'tribe_login_redirect', 'tribe_logout_redirect',
            'public_geneset_folder'
        )
    }
    run(('echo "CONFIG = {0}" > '
         '/home/adage/adage-server/adage/adage/config.py'
         ).format(pprint.PrettyPrinter().pformat(CONFIG_filtered)))
    if opts:
        opts = ' ' + opts
    with cd('/home/adage/adage-server'):
        run('git pull' + opts)


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
    """ run through npm and bower installations """
    with settings(warn_only=True):
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
    # NOTE: this creates the user, but does not set a password, which means
    # that user cannot login. To assign a password for the user, use the
    # following command: python manage.py changepassword {django_super}
    run(('python manage.py createsuperuser '
         '--username={django_super} '
         '--email={django_email} --noinput').format(**CONFIG))


@task
def rebuild_search_index():
    """ Rebuild the haystack search index """
    run('python manage.py rebuild_index --noinput')


@task
def import_data_and_index():
    """
    invoke import_data (which manually links to the get_pseudo_sdrf.py
    file extracted from the get_pseudomonas repository) and
    import_activity with sample data from CONFIG['data']
    """
    # import annotations
    run('python manage.py import_data "%s"' %
        CONFIG['data']['annotation_file'])
    # define organism and ml_model
    run('python manage.py organisms_create_or_update --taxonomy_id=208964 '
        '--scientific_name="Pseudomonas aeruginosa" '
        '--common_name="Pseudomonas aeruginosa"')
    run('python manage.py add_ml_model "Ensemble ADAGE 300" 208964')
    # import activity data
    run('python manage.py import_activity "%s" "Ensemble ADAGE 300"' %
        CONFIG['data']['activity_file'])
    # define a CrossRefDB for PseudoCap
    run('python manage.py genes_add_xrdb --name=PseudoCap '
        '--URL=http://www.pseudomonas.com/getAnnotation.do?locusID=_REPL_')
    # retrieve data file for PAO1 genes and load it
    run('wget -qO - "%s" | zcat > %s' %
        (CONFIG['data']['pao1_genes_url'], CONFIG['data']['pao1_genes_file']))
    run((
        'python manage.py genes_load_geneinfo --geneinfo_file="%s" '
        '--taxonomy_id=208964 --systematic_col=3 --symbol_col=2 '
        '--put_systematic_in_xrdb=PseudoCap') %
        CONFIG['data']['pao1_genes_file'])
    run('wget -qO - "%s" | zcat > %s' % (CONFIG['data']['gene_history_url'],
        CONFIG['data']['gene_history_file']))
    run(('python manage.py genes_load_gene_history %s 208964 '
        '--tax_id_col=1 --discontinued_id_col=3 --discontinued_symbol_col=4') %
        CONFIG['data']['gene_history_file'])
    run('python manage.py import_gene_network  %s "Ensemble ADAGE 300"' %
        CONFIG['data']['gene_network_file'])
    run('./manage.py import_node_gene_network %s "Ensemble ADAGE 300"' %
        CONFIG['data']['node_gene_network_file'])
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
    with cd(CONFIG['interface_dir']), \
            shell_env(PHANTOMJS_BIN='/usr/local/bin/phantomjs'), \
            prefix('source {0}/bin/activate'.format(CONFIG['virt_env'])):
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
    setup_host_conn()
    pull()
    env.dir = CONFIG['django_dir']
    env.virt_env = CONFIG['virt_env']
    with cd(env.dir), prefix('source {0}/bin/activate'.format(env.virt_env)):
        _check_env()
        rebuild_search_index()
    build_interface()
    reload_django()


@task
def deploy(use_config=None):
    """
    Execute a complete deployment to update an adage server with code changes
    """
    global CONFIG
    if use_config:
        CONFIG = use_config

    # test()
    print("beginning adage-server deploy")
    pull()
    init_setup_and_check()
    init_instance()
    build_interface()
    reload_django()
