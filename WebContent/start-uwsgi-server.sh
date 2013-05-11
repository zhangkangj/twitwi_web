#!/bin/bash

uwsgi -s /tmp/uwsgi.sock --module app:app -p 2 --chmod-socket 664 --logto ~/log/twithinks.log &
