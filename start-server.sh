#!/bin/bash
cd /Users/mihuldhakad/Downloads/Akkfguj
node backend/server.js > /tmp/server-output.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
sleep 2
echo "Checking server status..."
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "Server is running"
    cat /tmp/server-output.log
else
    echo "Server failed to start"
    cat /tmp/server-output.log
fi

