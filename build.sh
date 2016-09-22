#!/bin/bash

# Avoid silent and/or consumed failures within a bash script.
# if interested: http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

docker build -t greenescientist/adageserver .
