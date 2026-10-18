# 软件资源分享平台 - 自部署版本

基于 NestJS + Prisma + PostgreSQL + React 的软件资源分享平台，可直接部署到自己的服务器。

## 功能特性

- 用户注册/登录（JWT 鉴权）
- 管理员上传/编辑/删除软件
- 普通用户浏览、搜索、下载软件
- 软件分类、下载计数
- 站点设置（网站名称、URL）
- 本地文件存储（uploads 目录）
- Docker 一键部署

## 默认管理员账户

- 用户名：`lingpanrui`
- 密码：`qwe123123123`
- 首次启动自动创建

## 目录结构

```
self-host/
├── src/                 # 后端源码 (NestJS)
│   ├── main.ts
│   ├── app.module.ts
│   ├── prisma/          # Prisma 服务
│   ├── common/          # 守卫、过滤器、种子数据
│   └── modules/         # 业务模块（auth/software/upload/site-settings）
├── client/              # 前端源码 (React + Vite)
│   └── src/
├── prisma/
│   └── schema.prisma    # 数据库模型
├── uploads/             # 上传文件存储目录（Docker volume 挂载）
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `DATABASE_URL` | 是 | - | PostgreSQL 连接字符串 |
| `JWT_SECRET` | 是 | `software_site_jwt_secret_key_2024` | JWT 签名密钥，生产环境必须修改 |
| `PASSWORD_SALT` | 否 | `softwaresite_salt_2024` | 密码哈希加盐 |
| `UPLOAD_DIR` | 否 | `./uploads` | 上传文件存储目录 |
| `PORT` | 否 | `3000` | 服务监听端口 |
| `NODE_ENV` | 否 | `production` | 运行环境 |

---

## 方式一：Docker Compose 部署（推荐）

### 前置要求

- Docker ≥ 20.10
- Docker Compose ≥ 2.0

### 启动步骤

```bash
# 1. 进入 self-host 目录
cd self-host

# 2. （可选）修改 docker-compose.yml 中的密码和密钥
#    至少修改 JWT_SECRET 为随机字符串

# 3. 构建并启动
docker compose up -d --build

# 4. 查看日志
docker compose logs -f app

# 5. 访问应用
#    浏览器打开 http://服务器IP:3000
```

### 常用命令

```bash
# 停止服务
docker compose stop

# 重启服务
docker compose restart

# 查看日志
docker compose logs -f app

# 更新版本（重新构建）
docker compose up -d --build

# 完全删除（含数据库数据，谨慎）
docker compose down -v
```

### 数据持久化

- PostgreSQL 数据：Docker volume `postgres_data`
- 上传文件：Docker volume `uploads`
- 升级版本不会丢失数据

---

## 方式二：Node.js 直接运行

### 前置要求

- Node.js ≥ 22
- PostgreSQL ≥ 14
- npm ≥ 10

### 启动步骤

```bash
# 1. 进入 self-host 目录
cd self-host

# 2. 安装后端依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 PostgreSQL 连接信息
# DATABASE_URL=postgresql://user:password@localhost:5432/software_site
# JWT_SECRET=你的随机密钥

# 4. 初始化数据库表
npx prisma migrate deploy
# 或者开发环境用：npx prisma db push

# 5. 构建后端
npm run build

# 6. 安装前端依赖并构建
cd client
npm install
npm run build
# 构建产物会输出到 ../dist/client

# 7. 启动服务
cd ..
npm start
# 或
node dist/main.js

# 8. 访问应用
#    浏览器打开 http://localhost:3000
```

### 开发模式

```bash
# 后端开发（端口 3000）
npm run start:dev

# 前端开发（另开终端，端口 5173，自动代理 API 到 3000）
cd client
npm run dev
```

---

## 数据库表结构

### app_users（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | String | 用户名（唯一） |
| passwordHash | String | 密码哈希（SHA256 + salt） |
| role | String | 角色：admin / user |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### software（软件表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | String | 软件名称 |
| description | String | 软件描述 |
| version | String | 版本号 |
| category | String | 分类 |
| iconUrl | String | 图标 URL |
| fileUrl | String | 下载文件 URL |
| fileSize | BigInt | 文件大小（字节） |
| downloadCount | Int | 下载次数 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### site_settings（站点设置表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| siteName | String | 网站名称 |
| siteUrl | String | 站点地址 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

---

## API 接口

### 认证

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/auth/login | 登录 | 否 |
| POST | /api/auth/register | 注册 | 否 |
| GET | /api/auth/me | 获取当前用户信息 | 是 |

### 软件

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/software | 软件列表（支持 keyword/category/page/pageSize） | 否 |
| GET | /api/software/:id | 软件详情 | 否 |
| POST | /api/software | 新增软件 | 管理员 |
| PUT | /api/software/:id | 更新软件 | 管理员 |
| DELETE | /api/software/:id | 删除软件 | 管理员 |
| POST | /api/software/:id/download | 下载计数 +1 | 登录用户 |

### 上传

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/upload | 上传文件（multipart/form-data, field=file） | 管理员 |

### 站点设置

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/site-settings | 获取站点设置 | 否 |
| PUT | /api/site-settings | 更新站点设置 | 管理员 |

---

## Oracle Cloud 部署示例

### 1. 准备 Oracle Cloud 实例

- 创建一个 Ampere A1 或 x86 的 Compute 实例
- 操作系统选 Ubuntu 22.04 或 Oracle Linux 8
- 安全组开放 80、443、22 端口

### 2. 安装 Docker

```bash
# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# 重新登录后生效
```

### 3. 上传代码

```bash
# 本地打包
tar czf software-site.tar.gz self-host/

# 上传到服务器
scp software-site.tar.gz ubuntu@<服务器IP>:~/

# 服务器上解压
ssh ubuntu@<服务器IP>
tar xzf software-site.tar.gz
cd self-host
```

### 4. 修改配置并启动

```bash
# 修改 docker-compose.yml 中的 JWT_SECRET
# 用随机字符串替换：openssl rand -hex 32

# 启动
docker compose up -d --build

# 查看日志确认启动成功
docker compose logs -f app
```

### 5. （可选）配置 Nginx 反向代理 + HTTPS

如果要绑定域名和 HTTPS，可以加 Nginx 前置代理。

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 100M;
}
```

然后用 Let's Encrypt 申请证书。

---

## 安全建议

1. **修改默认密钥**：部署前务必修改 `JWT_SECRET` 和 `PASSWORD_SALT`
2. **修改管理员密码**：首次登录后在数据库中修改密码，或新增管理员后删除默认的
3. **限制上传大小**：如需调整，在上传模块配置 multer limits
4. **HTTPS**：生产环境务必使用 HTTPS
5. **数据库备份**：定期备份 PostgreSQL 数据

---

## 故障排查

### 应用启动失败，报数据库连接错误

检查 `DATABASE_URL` 是否正确，PostgreSQL 是否启动，防火墙是否开放 5432 端口。

### 上传文件失败

检查 `UPLOAD_DIR` 目录是否存在且有写入权限，Docker 部署检查 volume 挂载。

### 登录后立即被登出

检查 `JWT_SECRET` 是否一致（多实例部署时必须相同），检查系统时间是否正确。

### 前端页面空白

检查 `dist/client` 目录是否存在前端构建产物。Docker 部署需要确认构建阶段是否成功。
