#!/usr/bin/env python3
"""
Webhook 监听器 - 接收 Git 仓库推送事件并自动部署
使用方法：
1. 运行: python3 scripts/webhook-listener.py
2. 配置仓库 Webhook: http://your-server:9000/webhook
"""

import os
import sys
import json
import hmac
import hashlib
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

PORT = int(os.getenv('WEBHOOK_PORT', 9000))
SECRET = os.getenv('WEBHOOK_SECRET', 'change-me-to-a-secret')
DEPLOY_SCRIPT = os.getenv('DEPLOY_SCRIPT', '/root/ServerArchive/scripts/auto-deploy.sh')


def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] {message}', flush=True)


def verify_signature(payload, signature, secret):
    if not signature:
        return False
    
    # 尝试多种签名格式
    # GitHub 格式: sha256=xxx
    mac = hmac.new(secret.encode(), payload, hashlib.sha256)
    expected_github = 'sha256=' + mac.hexdigest()
    
    # Codeup 可能直接是 hex 字符串
    expected_plain = mac.hexdigest()
    
    try:
        return (hmac.compare_digest(expected_github, signature) or 
                hmac.compare_digest(expected_plain, signature))
    except:
        return False


def execute_deploy():
    log('🚀 开始部署...')
    try:
        result = subprocess.run(
            ['bash', DEPLOY_SCRIPT],
            capture_output=True,
            text=True,
            timeout=600
        )
        if result.returncode == 0:
            log('✅ 部署成功')
            log(result.stdout)
        else:
            log(f'❌ 部署失败: {result.returncode}')
            log(result.stderr)
    except subprocess.TimeoutExpired:
        log('❌ 部署超时（10分钟）')
    except Exception as e:
        log(f'❌ 部署错误: {e}')


class WebhookHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # 禁用默认日志，使用自定义日志
        pass

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'OK')
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != '/webhook':
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        # 验证签名
        signature = (self.headers.get('X-Hub-Signature-256') or 
                    self.headers.get('X-Codeup-Token') or 
                    self.headers.get('X-Gitlab-Token') or
                    self.headers.get('X-Gitee-Token'))
        
        if SECRET != 'change-me-to-a-secret':
            if not signature:
                log(f'⚠️  未收到签名头，可用头: {list(self.headers.keys())}')
            elif not verify_signature(body, signature, SECRET):
                log(f'⚠️  签名验证失败 (收到: {signature[:20]}...)')
                self.send_response(401)
                self.end_headers()
                self.wfile.write(b'Unauthorized')
                return
            else:
                log('✅ 签名验证通过')

        try:
            payload = json.loads(body.decode('utf-8'))
            ref = payload.get('ref', '')
            branch = ref.split('/')[-1] if ref else payload.get('repository', {}).get('default_branch', 'unknown')
            repo_name = payload.get('repository', {}).get('name', 'unknown')

            log(f'📦 收到推送事件: {repo_name} - {branch}')

            # 只在 master/main 分支推送时触发部署
            if branch in ['master', 'main']:
                execute_deploy()
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'Deployment triggered')
            else:
                log(f'⏭️  跳过非主分支: {branch}')
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'Ignored non-main branch')
        except Exception as e:
            log(f'❌ 处理错误: {e}')
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'Internal Server Error')


def main():
    server = HTTPServer(('0.0.0.0', PORT), WebhookHandler)
    log(f'🎧 Webhook 监听器运行在端口 {PORT}')
    log(f'📍 Webhook URL: http://your-server:{PORT}/webhook')
    log(f'🔐 Secret: {"未设置（跳过验证）" if SECRET == "change-me-to-a-secret" else "已设置"}')
    log(f'📜 部署脚本: {DEPLOY_SCRIPT}')
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log('⏹️  服务停止')
        sys.exit(0)


if __name__ == '__main__':
    main()
