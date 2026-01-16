#!/bin/bash
cd /home/ubuntu/inventoryfullstack
pkill -9 node 2>/dev/null
sleep 2
nohup node server.js > server.log 2>&1 < /dev/null &
sleep 3
ps aux | grep "node server" | grep -v grep
echo "Server started!"
