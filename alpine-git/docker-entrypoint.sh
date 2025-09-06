#!/bin/sh
set -e

# 检查是否已有 key
if [ ! -f /root/.ssh/id_ed25519 ]; then
    mkdir -p /root/.ssh
    chmod 700 /root/.ssh
    ssh-keygen -t ed25519 -C "docker@alpine-git" -N "" -f /root/.ssh/id_ed25519
    chmod 600 /root/.ssh/id_ed25519
fi

echo "===== Generated SSH Key ====="
cat /root/.ssh/id_ed25519.pub
echo "============================="

exec "$@"
