#!/usr/bin/env bash
set -euo pipefail

# 设置 Webhook 监听器为系统服务（使用 systemd）

APP_DIR="${APP_DIR:-/root/ServerArchive}"
WEBHOOK_PORT="${WEBHOOK_PORT:-9000}"
WEBHOOK_SECRET="${WEBHOOK_SECRET:-}"

if [[ -z "${WEBHOOK_SECRET}" ]]; then
  echo "正在生成 Webhook Secret..."
  WEBHOOK_SECRET="$(openssl rand -hex 32)"
  echo "生成的 Secret: ${WEBHOOK_SECRET}"
  echo "请将此 Secret 配置到 Git 仓库的 Webhook 设置中"
fi

echo "创建 systemd 服务文件..."
cat > /etc/systemd/system/webhook-listener.service << EOF
[Unit]
Description=Git Webhook Listener for Server Archive
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
Environment="WEBHOOK_PORT=${WEBHOOK_PORT}"
Environment="WEBHOOK_SECRET=${WEBHOOK_SECRET}"
Environment="DEPLOY_SCRIPT=${APP_DIR}/scripts/auto-deploy.sh"
ExecStart=/usr/bin/python3 ${APP_DIR}/scripts/webhook-listener.py
Restart=always
RestartSec=10
StandardOutput=append:/var/log/webhook-listener.log
StandardError=append:/var/log/webhook-listener-error.log

[Install]
WantedBy=multi-user.target
EOF

echo "设置脚本权限..."
chmod +x "${APP_DIR}/scripts/webhook-listener.py"
chmod +x "${APP_DIR}/scripts/auto-deploy.sh"

echo "创建日志目录..."
mkdir -p /var/log
touch /var/log/webhook-listener.log
touch /var/log/webhook-listener-error.log
touch /var/log/server-archive-deploy.log

echo "重载 systemd..."
systemctl daemon-reload

echo "启动服务..."
systemctl enable webhook-listener
systemctl start webhook-listener

echo ""
echo "=========================================="
echo "✅ Webhook 监听器已安装并启动"
echo "=========================================="
echo "服务状态: systemctl status webhook-listener"
echo "查看日志: tail -f /var/log/webhook-listener.log"
echo "部署日志: tail -f /var/log/server-archive-deploy.log"
echo ""
echo "Webhook URL: http://$(curl -s ifconfig.me):${WEBHOOK_PORT}/webhook"
echo "Webhook Secret: ${WEBHOOK_SECRET}"
echo ""
echo "请在 Git 仓库中配置 Webhook："
echo "1. 阿里云 Codeup: 仓库设置 -> Webhook -> 添加"
echo "2. GitHub: Settings -> Webhooks -> Add webhook"
echo "   - Payload URL: http://your-server:${WEBHOOK_PORT}/webhook"
echo "   - Content type: application/json"
echo "   - Secret: ${WEBHOOK_SECRET}"
echo "   - Events: Just the push event"
echo "=========================================="
