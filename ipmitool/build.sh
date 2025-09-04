#!/usr/bin/env bash

# 版本号参数
current_version=${1:-}

# 判断版本号是否为空
if [[ -z "$current_version" ]]; then
  echo "错误: 缺少版本号参数"
  echo "用法: $0 <版本号>"
  exit 1
fi

# 构建
docker build -t ipmitool:local .

# 镜像打标签并推送到 docker hub
docker tag ipmitool:local jiuwusan/ipmitool:"$current_version"
docker push jiuwusan/ipmitool:"$current_version"
# latest
docker tag ipmitool:local jiuwusan/ipmitool:latest
docker push jiuwusan/ipmitool:latest

# 构建成功
echo "pushed: jiuwusan/ipmitool:$current_version"

exit 0