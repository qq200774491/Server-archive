# 服务器部署指南

完整的服务器部署文档，包含前端、后端和数据库的部署步骤。

## 目录

- [系统要求](#系统要求)
- [快速部署（推荐）](#快速部署推荐)
- [手动部署](#手动部署)
- [配置说明](#配置说明)
- [常用操作](#常用操作)
- [故障排查](#故障排查)
- [性能优化](#性能优化)

## 系统要求

### 服务器配置
- **操作系统**: Linux (推荐 Ubuntu 20.04+, CentOS 7+)
- **CPU**: 2 核心以上
- **内存**: 2GB 以上（推荐 4GB）
- **硬盘**: 20GB 以上可用空间
- **网络**: 公网 IP 或域名

### 必需软件
- Docker 20.10+
- Docker Compose 2.0+
- Git

## 配置 SSH 访问权限（推荐）

为了避免每次操作都输入密码，强烈建议在服务器上配置 SSH 公钥访问。

1. **生成 SSH 密钥**（在服务器终端执行）
   ```bash
   ssh-keygen -t rsa -b 4096 -C "server_deploy"
   # 一路回车使用默认设置，不要设置密码短语
   ```

2. **查看公钥内容**
   ```bash
   cat ~/.ssh/id_rsa.pub
   ```

3. **添加公钥到代码平台**
   - 复制上面命令输出的完整内容（以 `ssh-rsa` 开头）。
   - 登录阿里云 Codeup，点击右上角头像 -> 个人设置 -> [SSH 公钥](https://codeup.aliyun.com/my/ssh)。
   - 点击"添加密钥"，粘贴公钥内容并保存。

4. **验证连接**
   ```bash
   ssh -T git@codeup.aliyun.com
   # 如果提示是否继续连接，输入 yes 并回车
   # 如果看到 "Welcome to Codeup" 即表示配置成功
   ```

## 快速部署（推荐）

使用自动部署脚本，一键完成所有配置。

### 1. 连接到服务器

```bash
ssh root@your-server-ip
```

### 2. 下载并运行部署脚本

```bash
# 下载部署脚本 (如果配置了 SSH，也可以直接克隆)
# curl -o deploy.sh https://codeup.aliyun.com/6545e63d5aabb5a01d762ef9/Warcraft3NewEngine.git/raw/master/deploy.sh

# 推荐：使用 SSH 克隆仓库 (需先完成上一步的 SSH 配置)
git clone git@codeup.aliyun.com:6545e63d5aabb5a01d762ef9/Warcraft3NewEngine.git ServerArchive
cd ServerArchive

# 添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 3. 访问应用

部署完成后，访问：
- **前端界面**: http://your-server-ip:3000
- **API 接口**: http://your-server-ip:3000/api

## 手动部署

如果自动脚本无法使用，可以按照以下步骤手动部署。

### 步骤 1: 安装 Docker 和 Docker Compose

#### Ubuntu/Debian

```bash
# 更新包索引
sudo apt-get update

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

#### CentOS/RHEL

```bash
# 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 步骤 2: 克隆项目

```bash
cd ~
# 使用 SSH 方式克隆 (推荐)
git clone git@codeup.aliyun.com:6545e63d5aabb5a01d762ef9/Warcraft3NewEngine.git ServerArchive
cd ServerArchive
```

### 步骤 3: 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量（重要！）
vim .env  # 或使用 nano .env
```

修改以下配置：

```env
# 数据库配置（修改密码！）
DATABASE_URL="postgresql://postgres:your-strong-password@db:5432/serverarchive?schema=public"

# 应用 URL（修改为你的服务器地址）
NEXT_PUBLIC_APP_URL="http://your-server-ip:3000"
```

同时修改 `docker-compose.yml` 中的数据库密码：

```yaml
services:
  db:
    environment:
      - POSTGRES_PASSWORD=your-strong-password  # 与上面保持一致
```

### 步骤 4: 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 等待数据库启动（约 10 秒）
sleep 10

# 运行数据库迁移
docker-compose --profile migrate up migrate
```

### 步骤 5: 验证部署

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试 API
curl http://localhost:3000/api/maps
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@db:5432/dbname` |
| `NEXT_PUBLIC_APP_URL` | 应用公网访问地址 | `http://example.com:3000` |

### 端口配置

默认端口映射：
- **3000**: Next.js 应用（前端 + API）
- **5432**: PostgreSQL（仅内部访问）

如需修改端口，编辑 `docker-compose.yml`：

```yaml
services:
  app:
    ports:
      - "8080:3000"  # 将外部端口改为 8080
```

### 数据持久化

数据库数据存储在 Docker Volume 中：

```bash
# 查看数据卷
docker volume ls | grep serverarchive

# 备份数据
docker-compose exec db pg_dump -U postgres serverarchive > backup.sql

# 恢复数据
docker-compose exec -T db psql -U postgres serverarchive < backup.sql
```

## 常用操作

### 查看服务状态

```bash
docker-compose ps
```

### 查看实时日志

```bash
# 所有服务
docker-compose logs -f

# 只看应用日志
docker-compose logs -f app

# 只看数据库日志
docker-compose logs -f db
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 只重启应用
docker-compose restart app
```

### 停止服务

```bash
docker-compose down
```

### 更新代码并重新部署

```bash
cd ~/ServerArchive

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose up -d --build

# 运行数据库迁移（如果有新的迁移）
docker-compose --profile migrate up migrate
```

### 进入容器调试

```bash
# 进入应用容器
docker-compose exec app sh

# 进入数据库容器
docker-compose exec db psql -U postgres serverarchive
```

### 清理资源

```bash
# 停止并删除容器、网络
docker-compose down

# 同时删除数据卷（谨慎！会删除数据库数据）
docker-compose down -v

# 清理未使用的镜像
docker image prune -a
```

## 自动维护（推荐配置）

项目提供了自动维护脚本，支持：
- 每天自动拉取最新代码并重启
- 每天自动清理日志和 Docker 资源
- 每 10 分钟健康检查

### 设置自动维护

```bash
# 添加执行权限
chmod +x scripts/maintenance.sh

# 一键设置所有定时任务
./scripts/maintenance.sh setup-cron
```

### 手动执行维护命令

```bash
# 更新代码并重启服务
./scripts/maintenance.sh update

# 仅重启服务（不更新代码）
./scripts/maintenance.sh restart

# 清理日志和 Docker 资源
./scripts/maintenance.sh clean

# 健康检查
./scripts/maintenance.sh health

# 执行所有维护任务
./scripts/maintenance.sh all
```

### 查看维护日志

```bash
# 查看维护日志
tail -f /var/log/serverarchive/maintenance.log

# 查看定时任务日志
tail -f /var/log/serverarchive/cron.log
```

### 自定义维护时间

默认的定时任务：
- **04:00** - 自动更新代码并重启
- **05:00** - 清理日志和 Docker 资源
- **每 10 分钟** - 健康检查

如需修改，编辑 crontab：

```bash
crontab -e
```

修改时间格式说明：`分 时 日 月 星期 命令`

```bash
# 示例：改为每天凌晨 3 点更新
0 3 * * * /root/ServerArchive/scripts/maintenance.sh update
```

## 防火墙配置

### Ubuntu (UFW)

```bash
# 允许 3000 端口
sudo ufw allow 3000/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### CentOS (firewalld)

```bash
# 允许 3000 端口
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# 查看状态
sudo firewall-cmd --list-all
```

## 反向代理配置（可选）

使用 Nginx 作为反向代理，可以实现：
- 域名访问
- HTTPS 加密
- 负载均衡

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

保存到 `/etc/nginx/sites-available/serverarchive`，然后：

```bash
sudo ln -s /etc/nginx/sites-available/serverarchive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs app
docker-compose logs db

# 检查端口是否被占用
sudo netstat -tulpn | grep 3000
sudo netstat -tulpn | grep 5432
```

### 数据库连接失败

```bash
# 检查数据库是否健康
docker-compose ps db

# 测试数据库连接
docker-compose exec db pg_isready -U postgres

# 查看数据库日志
docker-compose logs db
```

### 应用无法访问

```bash
# 检查防火墙
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-all  # CentOS

# 检查容器网络
docker network ls
docker network inspect serverarchive_default
```

### 迁移失败

```bash
# 重置数据库（谨慎！）
docker-compose down -v
docker-compose up -d db
sleep 10
docker-compose --profile migrate up migrate
docker-compose up -d app
```

## 性能优化

### 数据库优化

编辑 `docker-compose.yml`，添加数据库配置：

```yaml
services:
  db:
    command: postgres -c shared_buffers=256MB -c max_connections=200
```

### 应用扩展

如需横向扩展，可以启动多个应用实例：

```bash
docker-compose up -d --scale app=3
```

然后在前面加 Nginx 负载均衡。

### 监控和日志

```bash
# 限制日志大小
# 编辑 /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# 重启 Docker
sudo systemctl restart docker
```

## 安全建议

1. **修改默认密码**: 务必修改 PostgreSQL 默认密码
2. **使用 HTTPS**: 生产环境建议配置 SSL 证书
3. **限制访问**: 使用防火墙限制只允许必要的端口
4. **定期备份**: 定期备份数据库
5. **更新系统**: 保持系统和 Docker 更新到最新版本

```bash
# 定期备份脚本（添加到 crontab）
0 2 * * * cd ~/ServerArchive && docker-compose exec -T db pg_dump -U postgres serverarchive | gzip > backup_$(date +\%Y\%m\%d).sql.gz
```

## 监控和维护

### 设置自动启动

```bash
# Docker 容器自动重启已在 docker-compose.yml 中配置
# restart: unless-stopped

# 确保 Docker 服务开机自启
sudo systemctl enable docker
```

### 健康检查

```bash
# 创建健康检查脚本
cat > ~/health_check.sh << 'EOF'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/maps)
if [ $response -eq 200 ]; then
    echo "✓ Service is healthy"
    exit 0
else
    echo "✗ Service is down (HTTP $response)"
    exit 1
fi
EOF

chmod +x ~/health_check.sh

# 添加到 crontab，每 5 分钟检查一次
# */5 * * * * ~/health_check.sh
```

## 联系支持

如遇到部署问题，请提供：
1. 操作系统版本：`cat /etc/os-release`
2. Docker 版本：`docker --version`
3. 错误日志：`docker-compose logs`
4. 容器状态：`docker-compose ps`

---

部署愉快！如有问题请查看故障排查章节或联系技术支持。
