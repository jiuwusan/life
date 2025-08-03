#!/bin/bash

project_name=life
web_app_name=${1:-life-web-dev}

# 使用正则匹配规则
# if [[ "$web_app_name" =~ ^[a-zA-Z0-9-_]+(:[0-9]+\.[0-9]+\.[0-9]+)?$ ]]; then
#   echo "合法 镜像名称: $web_app_name"
# else
#   echo "非法 镜像名称: $web_app_name，名称不能为纯版本号！"
#   exit 1
# fi

# 获取最新分支情况
# git fetch --all

# 切换分支
# git checkout $remoteBranch

#git fetch origin 分支名称

#git reset --hard origin/分支名称

# 当前分支
# branch_name=$(git rev-parse --abbrev-ref HEAD)
# 还原文件
# git checkout ./config/config-api-$branch_name.ts ./config/config-api.ts
# git checkout -- ./
# 获取最新代码
# git pull
# 可执行
chmod a+x ./docker-build.sh
chmod a+x ./docker-start.sh
# 拷贝文件
# mv -f ./config/config-api-$branch_name.ts ./config/config-api.ts

# 读取当前版本号
version=$(grep '"code"' version.json | sed -E 's/.*"code": *"(.*)".*/\1/')

# 校验 web_app_name 是否携带版本号
if echo "$web_app_name" | grep -q ":"; then
  version=$(echo $web_app_name | cut -d ':' -f 2)
  web_app_name=$(echo $web_app_name | cut -d ':' -f 1)
fi


image_tag_name=$web_app_name:$version

echo "本次构建镜像版本：$image_tag_name"

# 安装依赖包
# yarn install

# 构建

# yarn build，并且将占用内存设置为 4GB
# NODE_OPTIONS="--max-old-space-size=4096" yarn build

# 构建 docker 镜像
docker build -t $image_tag_name .

# 添加 tag
# docker tag $web_app_name:$version docker.xinshucredit.com/riskalter/$web_app_name:$version
# docker tag $image_tag_name localhost/$project_name/$image_tag_name

# 将镜像推送到 私有仓库
# docker push docker.xinshucredit.com/$web_app_name/riskalter:$version
# docker push localhost/$project_name/$image_tag_name

# 删除构建 builder 缓存
# docker builder prune -f