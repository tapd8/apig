#!/bin/sh

WORK_DIR="`pwd`"
APP_HOME="$(cd `dirname $0`; pwd)"

echo "cd $APP_HOME"
cd $APP_HOME
# VERSION=`grep "version" $APP_HOME/package.json | awk -F: '{ print $2 }' | awk -F \" '{ print $2 }'`
VERSION=`git describe --long HEAD`
TARGET_NAME=apig-$VERSION
TARGET_PATH="$APP_HOME/deploy/$TARGET_NAME"

if [ -d $TARGET_PATH ]; then
	rm -rf $TARGET_PATH
fi

mkdir -p $TARGET_PATH/NDK/

echo "Untaring Node Development Kit..."
tar -xJf NDK/*.tar.xz -C $TARGET_PATH/NDK/
mv $TARGET_PATH/NDK/node-v*/ $TARGET_PATH/NDK/node/

echo "Copying files..."
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
	$TARGET_PATH

echo ";config.version = '$VERSION';" >> "$TARGET_PATH/config.js"
#sed -i '$d' "$APP_HOME/config.js"

echo "Removing some files..."
rm -rf \
	$TARGET_PATH/src/controllers/* \
	$TARGET_PATH/src/datasources/* \
	$TARGET_PATH/src/models/* \
	$TARGET_PATH/src/repositories/*

echo "Packaging $TARGET_PATH"
cd deploy
tar -zcf "$TARGET_NAME.tar.gz" $TARGET_NAME
cp howtoRunTpl.md $TARGET_NAME"-HowtoRunReadme.md.txt"

echo "Cleaning..."
rm -rf $TARGET_PATH

echo "Look here: "
echo "ls -lh $TARGET_PATH*"
#du -h "$TARGET_PATH.tar.gz"
ls -lh $TARGET_PATH*
echo "Done!"
#cd $WORK_DIR

