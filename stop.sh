#!/bin/sh

WORK_DIR="`pwd`"
APP_HOME="$(cd `dirname $0`; pwd)"
echo
echo "Stop API Server..."
echo
echo "APP_HOME: $APP_HOME"
echo "WORK_DIR: $WORK_DIR"
echo
# for pid in $( find $APP_HOME -name '*.pid' ); do
# 	kill -9 `cat $pid`
# done


if [ -f "$APP_HOME/app.pid" ]; then
	echo "API Web server process id is `cat $APP_HOME/app.pid`"
	kill -9 `cat $APP_HOME/app.pid` > /dev/null 2>&1
	rm $APP_HOME/app.pid
fi

if [ -f "$APP_HOME/server.pid" ]; then
	echo "Server main process id is `cat $APP_HOME/server.pid`"
	kill -9 `cat $APP_HOME/server.pid` > /dev/null 2>&1
	rm $APP_HOME/server.pid
fi
echo
echo "Stop API Server successful."
echo
