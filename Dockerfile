FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl

# 使用国内 npm 镜像加速，加重试防断连
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 15000 && \
    npm config set fetch-retry-maxtimeout 120000

COPY package.json ./
RUN npm install --production=false

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

WORKDIR /app/client
COPY client/package.json ./
RUN npm install --production=false

COPY client/vite.config.ts ./
COPY client/tsconfig.json ./
COPY client/tsconfig.node.json ./
COPY client/postcss.config.js ./
COPY client/index.html ./
COPY client/src ./src
COPY client/public ./public

RUN npm run build

WORKDIR /app

RUN rm -rf node_modules && npm install --production=true \
    && npm install prisma --save-optional

RUN mkdir -p /app/uploads

ENV NODE_ENV=production
ENV UPLOAD_DIR=/app/uploads

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
