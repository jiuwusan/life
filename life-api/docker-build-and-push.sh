#!/usr/bin/env bash

# 版本号参数
current_version=${1:-}
current_image_name="life-api"
# 判断版本号是否为空
if [[ -z "$current_version" ]]; then
  echo "错误: 缺少版本号参数"
  echo "用法: $0 <版本号>"
  exit 1
fi

# 构建
docker build -t $current_image_name:local .

# 镜像打标签并推送到 docker hub
docker tag $current_image_name:local jiuwusan/$current_image_name:"$current_version"
docker push jiuwusan/$current_image_name:"$current_version"
# latest
docker tag $current_image_name:local jiuwusan/$current_image_name:latest
docker push jiuwusan/$current_image_name:latest

# 构建成功
echo "pushed: jiuwusan/$current_image_name:$current_version"

exit 0