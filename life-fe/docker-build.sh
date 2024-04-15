#!/bin/bash

# 当前版本号
version=$1

remoteBranch=${2:-dev}

# 名称
webAppName=${3:-life-fe-$remoteBranch}

# 获取最新分支情况
git fetch --all

# 切换分支
git checkout $remoteBranch

#git fetch origin 分支名称

#git reset --hard origin/分支名称

# 获取最新代码
git pull

# 安装依赖包
# yarn install

# 构建
# yarn build
# yarn build，并且将占用内存设置为 4GB
# NODE_OPTIONS="--max-old-space-size=4096" yarn build

# 构建 docker 镜像
docker build -t $webAppName:$version .

# 添加 tag
# docker tag $webAppName:$version docker.xinshucredit.com/riskalter/$webAppName:$version
# docker tag $webAppName:$version localhost/jiuwusan-life/$webAppName:$version

# 将镜像推送到 私有仓库
# docker push docker.xinshucredit.com/$webAppName/riskalter:$version
# docker push localhost/jiuwusan-life/$webAppName:$version