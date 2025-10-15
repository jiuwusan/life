# 使用轻量 Node.js 基础镜像
FROM node:22-alpine

# 拷贝项目代码
RUN mkdir -p /pm2-code
COPY . /pm2-code/

# 创建工作目录
RUN mkdir -p /app
WORKDIR /app
COPY ./example ./example
COPY ./example ./services

# 全局安装 PM2
RUN npm install -g pm2

# 可选：安装 PM2 日志轮转插件（推荐）
RUN pm2 install pm2-logrotate && \
    pm2 set pm2-logrotate:max_size 10M && \
    pm2 set pm2-logrotate:retain 7 && \
    pm2 set pm2-logrotate:compress true

# 添加启动检测脚本
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

# 暴露端口（根据你的服务自行调整）
EXPOSE 3000

# 启动容器
ENTRYPOINT ["/entrypoint.sh"]
