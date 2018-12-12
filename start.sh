#!/bin/sh

APP_HOME="`pwd`"

if [ -d "$APP_HOME/dist" ]; then
	exec node . > /dev/null 2>&1 &
else
	npm run build
	exec node . > /dev/null 2>&1 &
fi

