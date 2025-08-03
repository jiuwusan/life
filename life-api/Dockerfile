# 第一阶段：安装依赖并构建应用程序
# 构建环境
FROM node:20.11.1 AS life-api-builder
# 创建工作目录
RUN mkdir -p /app
# 移到工作目录
WORKDIR /app
# 文件拷贝
COPY . .
# 安装 Yarn
# RUN npm install -g yarn
# 使用 Yarn 安装依赖
RUN yarn config set "strict-ssl" false -g
# RUN yarn config set registry https://registry.npmmirror.com
RUN yarn install --mutex network
# 构建
RUN yarn build

# 第二阶段：将构建好的文件复制到最终镜像
# 运行环境
FROM node:20.11.1-alpine
# Node 为生产环境
ENV NODE_ENV=production
# 指定 ip
ENV HOST 0.0.0.0
# 容器内创建目录
RUN mkdir -p /app
# 移到工作目录
WORKDIR /app
# 复制打包好的内容到容器内目录
COPY --from=life-api-builder /app/dist/ ./
COPY --from=life-api-builder /app/package.json ./package.json
# 安装依赖
RUN yarn config set "strict-ssl" false -g
# RUN yarn config set registry https://registry.npmmirror.com
RUN yarn install --production --mutex network
# 容器对外暴露的端口号
EXPOSE 9000
# 容器启动时执行的命令，类似npm run start
CMD ["node", "./main.js"]