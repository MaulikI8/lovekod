#!/bin/bash
# Check if node index.js is already running
if pgrep -f "node index.js" > /dev/null; then
    exit 0
fi

echo "[$(date)] Watchdog restarting single antigravity-daemon..." >> /home8/aashutos/antigravity-daemon/watchdog.log
cd /home8/aashutos/antigravity-daemon
nohup /opt/alt/alt-nodejs20/root/usr/bin/node index.js >> daemon.log 2>&1 &
