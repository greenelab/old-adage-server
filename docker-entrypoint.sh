#!/bin/bash

# The postgres container actually takes a little while to start up,
# and many times the django container finishes starting up before the
# postgres container does. If this happens, the django container will
# error out the first time it tries to access the postgres container.
# To avoid this, we will wait until the "python manage.py migrate",
# command to apply database migrations, runs.
# For more information, see: https://docs.docker.com/compose/startup-order/
until python manage.py migrate; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# Prepare log files and start outputting logs to stdout
touch /srv/logs/gunicorn.log
touch /srv/logs/access.log
tail -n 0 -f /srv/logs/*.log &

# Start Gunicorn processes
echo Starting Gunicorn.
exec gunicorn adage.wsgi:application \
    --name adage \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --log-level=info \
    --log-file=/srv/logs/gunicorn.log \
    --access-logfile=/srv/logs/access.log
