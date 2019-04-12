#!/bin/sh

WORK_DIR="`pwd`"
APP_HOME="$(cd `dirname $0`; pwd)"

echo "cd $APP_HOME"
cd $APP_HOME
# VERSION=`grep "version" $APP_HOME/package.json | awk -F: '{ print $2 }' | awk -F \" '{ print $2 }'`
VERSION=`git describe --long HEAD`
TARGET="apig-$VERSION"
DIST_DIR="$APP_HOME/$TARGET"

if [ -d $TARGET ]; then
	rm -rf $TARGET
fi

mkdir $TARGET

echo "copy files"
echo ";config.version = '$VERSION';" >> "$APP_HOME/config.js"
cp -r \
	*.js \
	*.json \
	*.ts \
	start.sh \
	stop.sh \
	generators \
	node_modules \
	public \
	src \
	$TARGET

sed -i '$d' "$APP_HOME/config.js"

rm -rf \
	$TARGET/src/controllers/* \
	$TARGET/src/datasources/* \
	$TARGET/src/models/* \
	$TARGET/src/repositories/*

echo "package $TARGET"
tar -zcf "$TARGET.tar.gz" $TARGET

rm -rf $TARGET

du -h "$TARGET.tar.gz"
echo "done."
#cd $WORK_DIR
