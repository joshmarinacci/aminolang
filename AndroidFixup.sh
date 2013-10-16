#!/bin/bash
set -e
set -x

OUTFILE=$1
MY_DIR=`dirname $1`
DESTDIR=system/amino



cat > $OUTFILE <<EOF
#include <stdio.h>
void main()
{
  printf("This is a simple C file to force the shell script to run so we can work around some android make limitations. Android HACK!\n");
}
EOF

NUM_PROCS=`cat /proc/cpuinfo  | egrep processor | cat -n | awk {'print $1'} | tail -1`
cd $MY_DIR;



echo "APO=$ANDROID_PRODUCT_OUT"
echo "NUM_PROCS=$NUM_PROCS"
echo "me=$0"
echo "outfile=$OUTFILE"
echo "my_dir=$MY_DIR"
echo "cwd="`pwd`

mkdir -p $ANDROID_PRODUCT_OUT/$DESTDIR
if [ -f ${ANDROID_PRODUCT_OUT}/system/lib/libaminolang.so ]; then
    # given how node imports addons, we CANNOT use a soft link here. sad but true.
    #ln -sf ../system/lib/libaminolang.so ${ANDROID_PRODUCT_OUT}/$DESTDIR/aminonative.node 
    cp ${ANDROID_PRODUCT_OUT}/system/lib/libaminolang.so  ${ANDROID_PRODUCT_OUT}/$DESTDIR/aminonative.node 
    echo "copying libaminolang.so to /data/phonetest/aminonative.node so node can load it as an addon"
else
    echo "no libaminolang.so to link node addon to"
fi


cp src/sg/amino.js $ANDROID_PRODUCT_OUT/$DESTDIR
cp src/sg/Bacon.js $ANDROID_PRODUCT_OUT/$DESTDIR
cp src/sg/widgets.js $ANDROID_PRODUCT_OUT/$DESTDIR
cp resources/*.* $ANDROID_PRODUCT_OUT/$DESTDIR
cp tests/phone/*.* $ANDROID_PRODUCT_OUT/$DESTDIR
mkdir -p $ANDROID_PRODUCT_OUT/$DESTDIR/fonts
cp fonts/* $ANDROID_PRODUCT_OUT/$DESTDIR/fonts
mkdir -p $ANDROID_PRODUCT_OUT/$DESTDIR/shaders
cp shaders/* $ANDROID_PRODUCT_OUT/$DESTDIR/shaders

#the following makes the  make system run everytime you build android. If you comment it out 
# you either need to touch the AndroidFixup.sh or 
# rm XXXX-dependencyForcer.c
# touch $ANDROID_BUILD_TOP/$0
