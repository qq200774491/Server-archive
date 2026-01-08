#!/usr/bin/env bash
set -euo pipefail

# 自动部署脚本 - 由 webhook 触发
# 在服务器上执行：拉取最新代码并重新构建

APP_DIR="${APP_DIR:-/root/ServerArchive}"
LOG_FILE="${LOG_FILE:-/var/log/server-archive-deploy.log}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

log "=========================================="
log "🚀 开始自动部署"
log "=========================================="

cd "${APP_DIR}"

log "📦 拉取最新代码..."
git fetch --all
git reset --hard origin/master

log "🛑 停止现有容器..."
docker compose down

log "🔨 构建新镜像..."
docker compose build --no-cache

log "🚀 启动服务..."
docker compose up -d

log "⏳ 等待服务启动..."
sleep 10

log "🏥 健康检查..."
if curl -sf http://localhost:3000/api/health > /dev/null; then
  log "✅ 部署成功！服务健康检查通过"
else
  log "⚠️  警告：健康检查失败，请检查日志"
  docker compose logs --tail=50
fi

log "📊 当前运行状态："
docker compose ps

log "=========================================="
log "✅ 部署完成"
log "=========================================="
