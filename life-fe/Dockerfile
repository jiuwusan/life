# 运行环境
FROM node:20.11.1
# 作者
MAINTAINER JiuWuSan
# Node 为生产环境
ENV NODE_ENV=production
# 指定 ip
ENV HOST 0.0.0.0
# 容器内创建目录 life-fe
RUN mkdir -p /app/life-fe
# 复制打包好的内容到容器内目录 /life-fe
COPY ./.next /app/life-fe/
COPY ./package-deployment /app/life-fe/package.json
# 生产环境安装依赖
RUN npm install --production
# cd到 前端 文件夹下
WORKDIR /app/life-fe
# 容器对外暴露的端口号
EXPOSE 3000
# 容器启动时执行的命令，类似npm run start
CMD ["next", "start"]