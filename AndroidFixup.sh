#!/bin/bash
set -e
set -x

OUTFILE=$1
MY_DIR=`dirname $1`




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


if [ -f ${ANDROID_PRODUCT_OUT}/system/lib/libaminolang.so ]; then
    ln -sf libaminolang.so ${ANDROID_PRODUCT_OUT}/system/lib/aminonative.node 
    echo "linking node addon name to lib"
else
    echo "no libaminolang.so to link node addon to"
fi

mkdir -p $ANDROID_PRODUCT_OUT/data/phonetest
cp src/sg/amino.js $ANDROID_PRODUCT_OUT/data/phonetest
cp src/sg/Bacon.js $ANDROID_PRODUCT_OUT/data/phonetest
cp src/jscommon/*.js $ANDROID_PRODUCT_OUT/data/phonetest
cp resources/*.* $ANDROID_PRODUCT_OUT/data/phonetest
cp tests/phone3.* $ANDROID_PRODUCT_OUT/data/phonetest

#the following makes the  make system run everytime you build android. If you comment it out 
# you either need to touch the AndroidFixup.sh or 
# rm XXXX-dependencyForcer.c
# touch $ANDROID_BUILD_TOP/$0