# 服务器部署指南（Server Archive）

本项目是一个 Next.js + PostgreSQL + Prisma 的单体应用（Web 管理端 + API 都由 Next.js 提供），推荐使用 Docker Compose 部署。

## 目录

- [快速部署（推荐：一键脚本）](#快速部署推荐一键脚本)
- [Docker Compose 部署（手动）](#docker-compose-部署手动)
- [环境变量](#环境变量)
- [健康检查](#健康检查)
- [常用运维命令](#常用运维命令)
- [备份建议](#备份建议)

## 快速部署（推荐：一键脚本）

在一台干净的 Linux 服务器上执行（root / sudo）：

```bash
curl -fsSL https://raw.githubusercontent.com/qq200774491/Server-archive/master/scripts/deploy-oneclick.sh | sudo bash
```

可选参数：
- 指定仓库/分支：`REPO_URL=... BRANCH=...`
- 指定安装目录：`APP_DIR=/opt/server-archive`
- 指定冒烟测试 URL：`APP_URL=http://localhost:3000`

脚本会自动生成 `ADMIN_TOKEN`、`PLAYER_TOKEN_SECRET` 写入 `.env`，并执行一次 v2 冒烟测试。

## Docker Compose 部署（手动）

### 1) 克隆代码

```bash
git clone https://github.com/qq200774491/Server-archive.git
cd Server-archive
```

### 2) 配置环境变量

```bash
cp .env.example .env
```

至少需要修改：
- `DATABASE_URL`（容器内访问 DB 时主机名应为 `db`）
- `ADMIN_TOKEN`
- `PLAYER_TOKEN_SECRET`

### 3) 启动服务 + 迁移

```bash
docker compose up -d --build
docker compose --profile migrate up migrate
```

### 4) 访问

- 管理端：`http://your-host:3000/admin/login`
- API：`http://your-host:3000/api/v2/*`

## 环境变量

参考 `.env.example`：

- `DATABASE_URL`：PostgreSQL 连接字符串
- `NEXT_PUBLIC_APP_URL`：应用对外访问 URL（用于前端拼接/展示）
- `ADMIN_TOKEN`：管理端 token（UI + Admin API）
- `PLAYER_TOKEN_SECRET`：玩家 Bearer token 签名密钥
- `CORS_ALLOWED_ORIGINS`：CORS 白名单（逗号分隔；`*` 表示全放开）

## 健康检查

建议使用：

```bash
curl -fsS http://localhost:3000/api/health
```

返回：

```json
{ "ok": true, "db": true }
```

## 常用运维命令

```bash
# 查看状态
docker compose ps

# 查看日志
docker compose logs -f

# 重启
docker compose restart

# 停止
docker compose down

# 停止并清空数据（谨慎）
docker compose down -v
```

### 维护脚本（可选）

仓库自带：`scripts/maintenance.sh`（更新/重启/清理/健康检查/安装 cron）。

```bash
PROJECT_DIR=/opt/server-archive ./scripts/maintenance.sh health
PROJECT_DIR=/opt/server-archive ./scripts/maintenance.sh setup-cron
```

## 备份建议

- 生产环境建议把数据库数据卷持久化（Compose 默认已做）。
- 可使用 `docker-compose.prod.yml` 的 `backup` profile（每日备份到 `./backups`，保留 7 天）。

