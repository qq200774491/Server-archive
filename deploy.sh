#!/usr/bin/env bash
set -euo pipefail

echo "[deprecated] deploy.sh 已弃用，请使用 scripts/deploy-oneclick.sh 或阅读 DEPLOYMENT.md"
echo "[deprecated] 正在转交给 scripts/deploy-oneclick.sh ..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/scripts/deploy-oneclick.sh"

