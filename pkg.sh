#!/bin/sh

APP_HOME="`pwd`"

VERSION=`grep "version" $APP_HOME/package.json | awk -F: '{ print $2 }' | awk -F \" '{ print $2 }'`
TARGET="apig-$VERSION"
DIST_DIR="$APP_HOME/$TARGET"

if [ -d $TARGET ]; then
	rm -rf $TARGET
fi

mkdir $TARGET

echo "copy files"
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

rm -rf \
	$TARGET/src/controllers/* \
	$TARGET/src/datasources/* \
	$TARGET/src/models/* \
	$TARGET/src/repositories/*

# echo "package $TARGET"
# tar -zcf "$TARGET.tar.gz" $TARGET

# rm -rf $TARGET

# du -h "$TARGET.tar.gz"
echo "done."
