#!/bin/sh

APP_HOME="`pwd`"

for pid in $( find $APP_HOME -name '*.pid' ); do
	kill -9 `cat $pid`
done

rm $APP_HOME/*.pid

