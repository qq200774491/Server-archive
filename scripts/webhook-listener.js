#!/usr/bin/env node
/**
 * Webhook 监听器 - 接收 Git 仓库推送事件并自动部署
 * 使用方法：
 * 1. 在服务器上安装: npm install -g http-server
 * 2. 运行: node scripts/webhook-listener.js
 * 3. 配置仓库 Webhook: http://your-server:9000/webhook
 */

const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'change-me-to-a-secret';
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || '/root/ServerArchive/scripts/auto-deploy.sh';

function verifySignature(payload, signature, secret) {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

function executeDeploy() {
  console.log(`[${new Date().toISOString()}] 🚀 开始部署...`);
  
  exec(`bash ${DEPLOY_SCRIPT}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] ❌ 部署失败:`, error);
      console.error(stderr);
      return;
    }
    console.log(`[${new Date().toISOString()}] ✅ 部署成功`);
    console.log(stdout);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const signature = req.headers['x-hub-signature-256'] || req.headers['x-codeup-signature'];
        
        // 如果设置了 SECRET，验证签名
        if (SECRET !== 'change-me-to-a-secret') {
          if (!verifySignature(body, signature, SECRET)) {
            console.log(`[${new Date().toISOString()}] ⚠️  签名验证失败`);
            res.writeHead(401);
            res.end('Unauthorized');
            return;
          }
        }
        
        const payload = JSON.parse(body);
        const branch = payload.ref?.split('/').pop() || payload.repository?.default_branch;
        
        console.log(`[${new Date().toISOString()}] 📦 收到推送事件: ${payload.repository?.name || 'unknown'} - ${branch}`);
        
        // 只在 master/main 分支推送时触发部署
        if (branch === 'master' || branch === 'main') {
          executeDeploy();
          res.writeHead(200);
          res.end('Deployment triggered');
        } else {
          console.log(`[${new Date().toISOString()}] ⏭️  跳过非主分支: ${branch}`);
          res.writeHead(200);
          res.end('Ignored non-main branch');
        }
      } catch (err) {
        console.error(`[${new Date().toISOString()}] ❌ 处理错误:`, err);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] 🎧 Webhook 监听器运行在端口 ${PORT}`);
  console.log(`[${new Date().toISOString()}] 📍 Webhook URL: http://your-server:${PORT}/webhook`);
  console.log(`[${new Date().toISOString()}] 🔐 Secret: ${SECRET === 'change-me-to-a-secret' ? '未设置（跳过验证）' : '已设置'}`);
  console.log(`[${new Date().toISOString()}] 📜 部署脚本: ${DEPLOY_SCRIPT}`);
});
