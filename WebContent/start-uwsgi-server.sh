#!/bin/bash

uwsgi	--master \
	--socket /tmp/twithinks.com.sock \
	--chmod-socket=666 \
	--wsgi-file app.py \
	--callable app \
	--processes 2  \
	--virtualenv venv
#	--logto ~/log/twithinks.log
