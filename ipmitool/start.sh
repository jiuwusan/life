#!/bin/bash

MONITOR_SCRIPT="/app/ipmitool.sh"

# 检查脚本是否存在
while [ ! -f "$MONITOR_SCRIPT" ]; do
    echo "[$(date)] $MONITOR_SCRIPT 不存在，等待..."
    sleep 15
done

# 添加可执行权限
chmod +x "$MONITOR_SCRIPT"

# 执行脚本
echo "[$(date)] 启动 $MONITOR_SCRIPT"

exec "$MONITOR_SCRIPT"
