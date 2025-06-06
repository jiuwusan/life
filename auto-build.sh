#!/bin/bash

# ========== 配置区 ==========
REPO_DIR="/data/workspace/life"    # 主项目根目录
BRANCH="dev"                       # 分支名称

# life-api 配置
API_DIR="$REPO_DIR/life-api"
API_BUILD_SCRIPT="docker-build.sh"
API_START_SCRIPT="docker-start.sh"
API_IMAGE_TAG="life-api-dev:1.0.1"
API_CONTAINER_NAME="life-api-dev"
API_SCALE=2

# life-fe 配置
FE_DIR="$REPO_DIR/life-fe"
FE_BUILD_SCRIPT="docker-build.sh"
FE_START_SCRIPT="docker-start.sh"
FE_IMAGE_TAG="life-web-dev:1.0.1"
FE_CONTAINER_NAME="life-web-dev"
FE_SCALE=2

LOG_FILE="$REPO_DIR/auto-build.log"
LOCK_FILE="/tmp/auto-build.lock"
LOCK_TIMEOUT=$((30 * 60)) # 30分钟 = 1800秒
# ============================

# 防并发锁检查
if [ -f "$LOCK_FILE" ]; then
    lock_mtime=$(stat -c %Y "$LOCK_FILE")
    now_time=$(date +%s)
    lock_age=$((now_time - lock_mtime))

    if [ $lock_age -lt $LOCK_TIMEOUT ]; then
        echo "$(date '+%F %T') - 上次构建还未完成，锁存在 $lock_age 秒，跳过本次执行。" >> "$LOG_FILE"
        exit 0
    else
        echo "$(date '+%F %T') - 发现过期锁，已存在 $lock_age 秒，强制清理锁，继续执行。" >> "$LOG_FILE"
        rm -f "$LOCK_FILE"
    fi
fi

# 创建锁文件
touch "$LOCK_FILE"
# 捕获退出，自动清理锁
trap 'rm -f "$LOCK_FILE"' EXIT

# 开始执行
cd "$REPO_DIR" || {
    echo "$(date '+%F %T') - ERROR: 进入项目根目录失败: $REPO_DIR" >> "$LOG_FILE"
    exit 1
}

# 获取本地和远程提交ID
local_commit=$(git rev-parse HEAD)
git fetch origin "$BRANCH" >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    echo "$(date '+%F %T') - ERROR: git fetch 失败，退出。" >> "$LOG_FILE"
    exit 1
fi

remote_commit=$(git rev-parse origin/"$BRANCH")

if [ "$local_commit" != "$remote_commit" ]; then
    echo "$(date '+%F %T') - 代码有更新，开始打包..." >> "$LOG_FILE"

    # 拉取最新代码
    git pull origin "$BRANCH" >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        echo "$(date '+%F %T') - ERROR: git pull 失败，退出。" >> "$LOG_FILE"
        exit 1
    fi

    # 自动给关键脚本赋可执行权限
    echo "$(date '+%F %T') - 设置可执行权限" >> "$LOG_FILE"
    chmod +x "$REPO_DIR/auto-build.sh" >> "$LOG_FILE" 2>&1
    chmod +x "$API_DIR/$API_BUILD_SCRIPT" >> "$LOG_FILE" 2>&1
    chmod +x "$API_DIR/$API_START_SCRIPT" >> "$LOG_FILE" 2>&1
    chmod +x "$FE_DIR/$FE_BUILD_SCRIPT" >> "$LOG_FILE" 2>&1
    chmod +x "$FE_DIR/$FE_START_SCRIPT" >> "$LOG_FILE" 2>&1

    # life-api 打包和启动
    cd "$API_DIR" || {
        echo "$(date '+%F %T') - ERROR: 进入 $API_DIR 失败" >> "$LOG_FILE"
        exit 1
    }
    echo "$(date '+%F %T') - life-api 打包" >> "$LOG_FILE"
    "./$API_BUILD_SCRIPT" >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        echo "$(date '+%F %T') - ERROR: life-api 打包失败" >> "$LOG_FILE"
        exit 1
    fi

    echo "$(date '+%F %T') - life-api 启动" >> "$LOG_FILE"
    "./$API_START_SCRIPT" "$API_IMAGE_TAG" "$API_CONTAINER_NAME" "$API_SCALE" >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        echo "$(date '+%F %T') - ERROR: life-api 启动失败" >> "$LOG_FILE"
        exit 1
    fi

    # life-fe 打包和启动
    cd "$FE_DIR" || {
        echo "$(date '+%F %T') - ERROR: 进入 $FE_DIR 失败" >> "$LOG_FILE"
        exit 1
    }
    echo "$(date '+%F %T') - life-fe 打包" >> "$LOG_FILE"
    "./$FE_BUILD_SCRIPT" >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        echo "$(date '+%F %T') - ERROR: life-fe 打包失败" >> "$LOG_FILE"
        exit 1
    fi

    echo "$(date '+%F %T') - life-fe 启动" >> "$LOG_FILE"
    "./$FE_START_SCRIPT" "$FE_IMAGE_TAG" "$FE_CONTAINER_NAME" "$FE_SCALE" >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        echo "$(date '+%F %T') - ERROR: life-fe 启动失败" >> "$LOG_FILE"
        exit 1
    fi

    echo "$(date '+%F %T') - 打包并启动完成。" >> "$LOG_FILE"
else
    echo "$(date '+%F %T') - 代码已是最新，无需打包。" >> "$LOG_FILE"
fi

# 正常结束
exit 0
