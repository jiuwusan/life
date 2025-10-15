#!/usr/bin/env bash

# 版本号参数
current_version=${1:-}

image_name="pm2"

# 判断版本号是否为空
if [[ -z "$current_version" ]]; then
  echo "错误: 缺少版本号参数"
  echo "用法: $0 <版本号>"
  exit 1
fi

# 构建
docker build -t $image_name:local .

# 镜像打标签并推送到 docker hub
docker tag $image_name:local jiuwusan/$image_name:"$current_version"
docker push jiuwusan/$image_name:"$current_version"
# latest
docker tag $image_name:local jiuwusan/$image_name:latest
docker push jiuwusan/$image_name:latest

# 构建成功
echo "pushed: jiuwusan/$image_name:$current_version"

exit 0