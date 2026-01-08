#!/usr/bin/env bash
set -euo pipefail

# 自动部署脚本 - 由 webhook 触发
# 在服务器上执行：拉取最新代码并重新构建

APP_DIR="${APP_DIR:-/root/ServerArchive}"
LOG_FILE="${LOG_FILE:-/var/log/server-archive-deploy.log}"
LOCK_FILE="/tmp/server-archive-deploy.lock"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

# 检查是否有部署正在进行
if [ -f "${LOCK_FILE}" ]; then
  log "⚠️  检测到正在进行的部署，跳过本次部署"
  exit 0
fi

# 创建锁文件
touch "${LOCK_FILE}"
trap "rm -f ${LOCK_FILE}" EXIT

log "=========================================="
log "🚀 开始自动部署"
log "=========================================="

cd "${APP_DIR}"

log "📦 拉取最新代码..."
git fetch --all
git reset --hard origin/master

log "� 快速重启服务..."
docker compose restart app

log "⏳ 等待服务重启..."
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
