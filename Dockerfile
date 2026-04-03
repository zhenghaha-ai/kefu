FROM node:20-alpine

WORKDIR /app

# 先拷贝 package.json 利用 Docker 缓存
COPY package.json ./
COPY frontend/package.json ./frontend/

# 安装后端依赖
RUN npm install --omit=dev

# 安装前端依赖（需要 devDependencies 来构建）
RUN npm --prefix frontend install

# 拷贝全部源码
COPY . .

# 构建前端
RUN npm --prefix frontend run build

# 构建完成后清理前端 node_modules 减小镜像
RUN rm -rf frontend/node_modules frontend/src

EXPOSE 3000

CMD ["node", "src/index.js"]
