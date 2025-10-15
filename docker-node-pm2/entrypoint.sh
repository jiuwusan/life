#!/bin/sh
set -e

# 检查配置文件是否存在
if [ ! -f /app/services/ecosystem.config.js ]; then
  echo "/app/ecosystem.config.js not found! start copy from /app/example..."
  mkdir -p /app/services
  cp -r /app/example/* /app/services/
fi

echo "✅ Starting PM2 App(s)..."

exec pm2-runtime /app/services/ecosystem.config.js
