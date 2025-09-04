# FROM alpine:latest

# 安装 ipmitool 和 bash
# RUN apk add --no-cache ipmitool bash curl

FROM centos:7
# 替换阿里云 yum 源
RUN mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak 
COPY CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo
RUN yum clean all && yum makecache
# 安装 ipmitool 和 bash
RUN yum install -y ipmitool bash curl && yum clean all

# 创建工作目录
RUN mkdir -p /app

# 移到工作目录
WORKDIR /app

# 拷贝启动脚本
COPY start.sh /usr/local/bin/start.sh

# 可执行
RUN chmod +x /usr/local/bin/start.sh

# 启动
CMD ["/usr/local/bin/start.sh"]