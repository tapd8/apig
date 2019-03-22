#!/bin/sh

WORK_DIR="`pwd`"
APP_HOME="$(cd `dirname $0`; pwd)"

echo "Stop API Server..."
echo "APP_HOME: $APP_HOME"
echo "WORK_DIR: $WORK_DIR"

# for pid in $( find $APP_HOME -name '*.pid' ); do
# 	kill -9 `cat $pid`
# done

echo "Server main process id is `cat $APP_HOME/server.pid`, web server process id is `cat $APP_HOME/app.pid`"

kill -9 `cat $APP_HOME/app.pid`
kill -9 `cat $APP_HOME/server.pid`

rm $APP_HOME/*.pid

echo "Current running node process id's is `pidof node`"
