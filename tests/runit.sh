cd /data/phonetest
chmod 755 node
NODE_PATH=.
LD_LIBRARY_PATH=/data/phonetest
./node "$@"
