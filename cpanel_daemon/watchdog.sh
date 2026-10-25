#!/bin/bash
if ! pgrep -f "antigravity-daemon/index.js" > /dev/null; then
    echo "[$(date)] Watchdog restarting antigravity-daemon..." >> /home8/aashutos/antigravity-daemon/watchdog.log
    cd /home8/aashutos/antigravity-daemon
    nohup /opt/alt/alt-nodejs20/root/usr/bin/node index.js >> daemon.log 2>&1 &
fi
