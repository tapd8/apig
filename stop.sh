#!/bin/sh

APP_HOME="`pwd`"

for pid in $( find $APP_HOME -name '*.pid' | xargs -n 1 cat ); do
	kill -9 $pid > /dev/null 2>&1
done

rm $APP_HOME/*.pid

