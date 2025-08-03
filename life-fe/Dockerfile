# 第一阶段：安装依赖并构建应用程序

# FROM node:20.11.1 AS builder_node_modules
FROM node:20.11.1-alpine AS builder_node_modules
# 创建工作目录
RUN mkdir -p /app
# 移到工作目录
WORKDIR /app
# 文件拷贝
# COPY package.json yarn.lock ./
COPY package.json ./
# 安装 Yarn
# RUN npm install -g yarn
# 使用 Yarn 安装依赖
RUN yarn config set "strict-ssl" false -g
# RUN yarn config set registry https://registry.npmmirror.com
# RUN yarn install --frozen-lockfile
RUN yarn install

# 第二阶段：将构建好的文件复制到最终镜像
FROM node:20.11.1 AS builder_dist
# 创建工作目录
RUN mkdir -p /app
# 移到工作目录
WORKDIR /app
COPY . .
COPY --from=builder_node_modules /app/node_modules ./node_modules
# 构建
RUN yarn build

# 第三阶段：将构建好的文件复制到最终镜像
# 运行环境
FROM node:20.11.1-alpine
# FROM node:20.11.1
# Node 为生产环境
ENV NODE_ENV=production
# 指定 ip
ENV HOST 0.0.0.0
# 容器内创建目录
RUN mkdir -p /app
# 移到工作目录
WORKDIR /app
# 复制打包好的内容到容器内目录
COPY --from=builder_dist /app/.next ./.next
COPY --from=builder_dist /app/package.json ./package.json
# 生产环境安装依赖
RUN yarn config set "strict-ssl" false -g
# RUN yarn config set registry https://registry.npmmirror.com
RUN yarn install --production
# 容器对外暴露的端口号
EXPOSE 3000
# 容器启动时执行的命令，类似npm run start
CMD ["yarn", "start"]