#!/bin/bash

WORK_DIR="`pwd`"
APP_HOME="$(cd `dirname $0`; pwd)"
export PATH=$APP_HOME/NDK/node/bin:$PATH

echo
echo "Stop API Server..."
echo
echo "APP_HOME: $APP_HOME"
echo "WORK_DIR: $WORK_DIR"
echo
# for pid in $( find $APP_HOME -name '*.pid' ); do
# 	kill -9 `cat $pid`
# done

port=""
if [ "$API_SERVER_PORT" = "" ]; then
	port="3080"
else
	port="$API_SERVER_PORT"
fi

kill `ps x | grep "$APP_HOME/app.js" | grep -v grep | awk '{print $1}'` > /dev/null 2>&1
kill `ps x | grep "$APP_HOME/app_cluster.js" | grep -v grep | awk '{print $1}'` > /dev/null 2>&1
kill `ps x | grep "$APP_HOME/index.js" | grep -v grep | awk '{print $1}'` > /dev/null 2>&1

echo
echo "Stop API Server successful."
echo
