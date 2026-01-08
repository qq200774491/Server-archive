#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-http://localhost:3000}"
ADMIN_USERNAME="${ADMIN_USERNAME:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

if [[ -z "${ADMIN_USERNAME}" || -z "${ADMIN_PASSWORD}" ]]; then
  echo "Missing ADMIN_USERNAME / ADMIN_PASSWORD (export ADMIN_USERNAME=... ADMIN_PASSWORD=...)" >&2
  exit 1
fi

echo "[smoke] APP_URL=${APP_URL}"

require() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing command: $1" >&2; exit 1; }
}

require curl
require jq
require mktemp

COOKIE_JAR="$(mktemp)"
trap 'rm -f "${COOKIE_JAR}"' EXIT

echo "[smoke] 0) admin login"
curl -fsS -X POST "${APP_URL}/api/admin/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  -c "${COOKIE_JAR}" \
  >/dev/null

echo "[smoke] 1) issue player token"
TOKEN="$(
  curl -fsS -X POST "${APP_URL}/api/v2/auth/player" \
    -H 'Content-Type: application/json' \
    -d '{"playerId":"player-001","playerName":"测试玩家"}' \
  | jq -r '.token'
)"
if [[ -z "${TOKEN}" || "${TOKEN}" == "null" ]]; then
  echo "Failed to get player token" >&2
  exit 1
fi

echo "[smoke] 2) create map (admin)"
MAP_ID="$(
  curl -fsS -X POST "${APP_URL}/api/v2/maps" \
    -H 'Content-Type: application/json' \
    -b "${COOKIE_JAR}" \
    -d '{"name":"测试地图","description":"smoke"}' \
  | jq -r '.id'
)"

echo "[smoke] 3) join map (bearer)"
curl -fsS -X POST "${APP_URL}/api/v2/maps/${MAP_ID}/join" \
  -H "Authorization: Bearer ${TOKEN}" \
  >/dev/null

echo "[smoke] 4) create archive (bearer)"
ARCHIVE_ID="$(
  curl -fsS -X POST "${APP_URL}/api/v2/maps/${MAP_ID}/archives" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"name":"存档1","data":{"level":1}}' \
  | jq -r '.id'
)"

echo "[smoke] 5) create dimension (admin)"
DIM_ID="$(
  curl -fsS -X POST "${APP_URL}/api/v2/maps/${MAP_ID}/dimensions" \
    -H 'Content-Type: application/json' \
    -b "${COOKIE_JAR}" \
    -d '{"name":"分数","unit":"分","sortOrder":"DESC"}' \
  | jq -r '.id'
)"

echo "[smoke] 6) submit score (bearer)"
curl -fsS -X POST "${APP_URL}/api/v2/archives/${ARCHIVE_ID}/scores" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{\"scores\":[{\"dimensionId\":\"${DIM_ID}\",\"value\":123}]}" \
  >/dev/null

echo "[smoke] 7) leaderboard mode=player (bearer)"
curl -fsS "${APP_URL}/api/v2/maps/${MAP_ID}/leaderboard/${DIM_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq -e '.data | length >= 1' >/dev/null

echo "[smoke] 8) leaderboard mode=archive (bearer)"
curl -fsS "${APP_URL}/api/v2/maps/${MAP_ID}/leaderboard/${DIM_ID}?mode=archive" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq -e '.data | length >= 1' >/dev/null

echo "[smoke] 9) my rank (bearer)"
curl -fsS "${APP_URL}/api/v2/maps/${MAP_ID}/leaderboard/${DIM_ID}/me" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq -e '.rank != null' >/dev/null

echo "[smoke] OK"

