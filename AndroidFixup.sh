#!/bin/bash
set -e
set -x

OUTFILE=$1
MY_DIR=`dirname $1`

HOST_DIR=$ANDROID_HOST_OUT


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

cd ${ANDROID_PRODUCT_OUT}/system/lib
if [ -f libaminolang.so ]; then
    ln -sf aminonative.node libaminolang.so
#echo "linking node addon name to lib"
fi

mkdir -p $ANDROID_PRODUCT_OUT/data/phonetest
cp $MY_DIR/src/node/amino.js $ANDROID_PRODUCT_OUT/data/phonetest
cp $MY_DIR/src/jscommon/*.js $ANDROID_PRODUCT_OUT/data/phonetest
cp $MY_DIR/tests/test1.* $ANDROID_PRODUCT_OUT/data/phonetest
cp $MY_DIR/tests/skin.png $ANDROID_PRODUCT_OUT/data/phonetest
cp $MY_DIR/tests/segfault.js $ANDROID_PRODUCT_OUT/data/phonetest

#the following makes the  make system run everytime you build android. If you comment it out 
# you either need to touch the AndroidFixup.sh or 
# rm XXXX-dependencyForcer.c
# touch $ANDROID_BUILD_TOP/$0