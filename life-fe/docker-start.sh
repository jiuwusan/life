#!/bin/bash

# 当前版本号
appVersion=$1
# 名称
appName=$2
# 
slbCount=${3:-1}
# 镜像
# dockerImage=localhost/jiuwusan-life/$appVersion
dockerImage=$appVersion
# 映射本机地址
apiHost=jiuwusan.cn:172.17.0.1
# 拉取
# docker pull $dockerImage
# 负载均衡
for ((idx = 0; idx < $slbCount; idx++)); do
    webServer=$appName-$idx
    docker stop $webServer
    docker remove $webServer
    # 这里需要 注入 api url host，同时暴露 3000 端口
    docker run -itd \
        -e TZ=Asia/Shanghai \
        -e DELUGE_LOGLEVEL=error \
        --network=jiuwusan-network \
        --add-host=$apiHost \
        --name=$webServer \
        --restart=always $dockerImage
done
#删除无关镜像
docker builder prune -f
