#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/qq200774491/Server-archive.git}"
BRANCH="${BRANCH:-}"
APP_DIR="${APP_DIR:-/opt/server-archive}"
APP_URL="${APP_URL:-http://localhost:3000}"

min_glibc_ok() {
  if ! command -v ldd >/dev/null 2>&1; then
    return 0
  fi
  local ver
  ver="$(ldd --version 2>/dev/null | head -n1 | sed -n 's/.* \([0-9]\+\.[0-9]\+\).*/\1/p')"
  if [[ -z "${ver}" ]]; then
    return 0
  fi
  local major minor
  major="${ver%%.*}"
  minor="${ver##*.}"
  # Prisma/Node modern builds typically require glibc >= 2.17.
  if [[ "${major}" -lt 2 ]]; then return 1; fi
  if [[ "${minor}" -lt 17 ]]; then return 1; fi
  return 0
}

require_supported_os() {
  if [[ -f /etc/os-release ]]; then
    # shellcheck disable=SC1091
    . /etc/os-release
    if [[ -n "${VERSION_ID:-}" ]]; then
      case "${ID:-}" in
        centos|rhel|almalinux|rocky)
          if [[ "${VERSION_ID%%.*}" -lt 7 ]]; then
            echo "Unsupported OS: ${PRETTY_NAME}. Please upgrade to CentOS/RHEL 7+ (recommended Rocky 8/9 or Ubuntu 22.04+)." >&2
            exit 2
          fi
          ;;
      esac
    fi
  fi

  if ! min_glibc_ok; then
    echo "Unsupported system: glibc is too old for Node/Prisma. Please upgrade the OS (recommended Ubuntu 22.04+/Debian 12/Rocky 8+)." >&2
    exit 2
  fi
}

ensure_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    echo "Please run as root (or via sudo)." >&2
    exit 1
  fi
}

have() { command -v "$1" >/dev/null 2>&1; }

install_base_tools_debian() {
  apt-get update
  apt-get install -y ca-certificates curl git openssl jq
}

install_base_tools_rhel() {
  (dnf -y install ca-certificates curl git openssl jq) || (yum -y install ca-certificates curl git openssl jq)
}

install_docker_if_missing() {
  if have docker && docker compose version >/dev/null 2>&1; then
    return
  fi
  curl -fsSL https://get.docker.com | sh
}

prepare_env_file() {
  cd "${APP_DIR}"
  if [[ ! -f .env ]]; then
    cp .env.example .env
  fi

ADMIN_TOKEN="$(openssl rand -hex 32)"
PLAYER_TOKEN_SECRET="$(openssl rand -hex 64)"

if grep -q '^ADMIN_TOKEN=' .env; then
  sed -i "s/^ADMIN_TOKEN=.*/ADMIN_TOKEN=\"${ADMIN_TOKEN}\"/" .env
else
  echo "ADMIN_TOKEN=\"${ADMIN_TOKEN}\"" >> .env
fi

if grep -q '^PLAYER_TOKEN_SECRET=' .env; then
  sed -i "s/^PLAYER_TOKEN_SECRET=.*/PLAYER_TOKEN_SECRET=\"${PLAYER_TOKEN_SECRET}\"/" .env
else
  echo "PLAYER_TOKEN_SECRET=\"${PLAYER_TOKEN_SECRET}\"" >> .env
fi

export ADMIN_TOKEN PLAYER_TOKEN_SECRET
}

clone_or_update_repo() {
  if [[ -d "${APP_DIR}/.git" ]]; then
    cd "${APP_DIR}"
    git fetch --all --prune
    if [[ -n "${BRANCH}" ]]; then
      git checkout "${BRANCH}"
      git pull --ff-only
    else
      git pull --ff-only
    fi
    return
  fi

mkdir -p "$(dirname "${APP_DIR}")"
rm -rf "${APP_DIR}"
git clone "${REPO_URL}" "${APP_DIR}"
cd "${APP_DIR}"
if [[ -n "${BRANCH}" ]]; then
  git checkout "${BRANCH}"
fi
}

deploy_compose() {
  cd "${APP_DIR}"
  docker compose up -d
  docker compose --profile migrate up migrate
  docker compose ps
}

smoke_test() {
  cd "${APP_DIR}"
  APP_URL="${APP_URL}" ADMIN_TOKEN="${ADMIN_TOKEN}" ./scripts/smoke-v2.sh
}

main() {
  ensure_root
  require_supported_os

  if [[ -f /etc/os-release ]]; then
    . /etc/os-release
  fi

  if have apt-get; then
    install_base_tools_debian
  elif have dnf || have yum; then
    install_base_tools_rhel
  else
    echo "Unsupported distro: cannot find apt-get/dnf/yum" >&2
    exit 1
  fi

  install_docker_if_missing

  clone_or_update_repo
  prepare_env_file
  deploy_compose
  smoke_test

  echo
  echo "[done] Deployed to ${APP_DIR}"
  echo "[done] App should be available at ${APP_URL}"
  echo "[done] ADMIN_TOKEN=${ADMIN_TOKEN}"
  echo "[done] PLAYER_TOKEN_SECRET=${PLAYER_TOKEN_SECRET}"
}

main "$@"
