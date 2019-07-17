#!/bin/bash

#export API_SERVER_ENV=$1

WORK_DIR="`pwd`"
APP_HOME="$(cd `dirname $0`; pwd)"

export PATH=$APP_HOME/NDK/node/bin:$PATH

echo
echo
echo "Shell PATH: "$PATH
echo
echo "Path of node: `which node`"
echo "Version of node: `node -v`"
# echo "Version of npm: "
# npm version
# echo "Version of npx: `npx -v`"
echo
echo "Start API Server..."
echo
echo "APP_HOME: $APP_HOME"
echo "WORK_DIR: $WORK_DIR"
echo
echo "Watch logs with:"
echo "tail -f ${TAPDATA_WORK_DIR:=~/.tapdata}/logs/api-server.log"
echo
echo "Config file at:"
echo "$APP_HOME/config.js"
echo
echo "Stop API server with:"
echo "$APP_HOME/stop.sh"
echo

if [ -d "$APP_HOME/dist" ]; then
	node $APP_HOME/index.js > /dev/null 2>&1 &
	# node $APP_HOME/index.js > /dev/null &
	echo "API Server started."
else
	cd $APP_HOME
	npm run build
	cd $WORK_DIR
	node $APP_HOME/index.js > /dev/null 2>&1 &
	# node $APP_HOME/index.js > /dev/null &
	echo "API Server started."
fi

echo "$APP_HOME/node_modules/pm2/bin/pm2 l"
$APP_HOME/node_modules/pm2/bin/pm2 l
