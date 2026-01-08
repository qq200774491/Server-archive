# 审计记录（前端 / 后端 / 部署）

本文记录对 Server Archive 代码与文档的一次“实现对齐”审计结果：哪些功能已落地、哪些缺口会影响运行/安全、以及后续建议。

更新时间：2026-01-07

## 结论摘要

- **已修复（本次）**：`GET /api/v2/archives/:archiveId` 之前只校验 Bearer token，但**未校验存档归属**，导致任意登录玩家可读取他人存档详情；现已改为**仅允许存档所有者访问**。
- **已补齐（本次）**：管理端“地图详情”页面新增**创建排行榜维度**入口（调用 `POST /api/v2/maps/:mapId/dimensions`）。
- **已对齐（本次）**：管理端排行榜默认改为**每玩家最佳**（与 v2 默认行为一致），并支持切换“每存档”。
- **需要尽快对齐（部署/运维）**：
  - `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` / `PLAYER_TOKEN_SECRET` 是 v2 必需环境变量，文档/Compose 配置需要保证容器能拿到这些值。
  - 健康检查建议使用 `GET /api/health`（无需鉴权），避免用 v1 或需要鉴权的接口。

## 已实现功能清单（以 v2 为准）

### 玩家端（游戏客户端）

- `POST /api/v2/auth/player`：签发 Bearer token（并 upsert 玩家）
- `GET /api/v2/maps`：获取地图列表（Bearer，支持 `page/limit`）
- `GET /api/v2/maps/:mapId`：地图详情（Bearer）
- `POST /api/v2/maps/:mapId/join`：加入地图（Bearer）
- `GET /api/v2/maps/:mapId/archives`：我的存档列表（Bearer，支持 `page/limit`）
- `POST /api/v2/maps/:mapId/archives`：创建存档（Bearer）
- `GET /api/v2/archives/:archiveId`：存档详情（Bearer，**仅所有者**）
- `PUT /api/v2/archives/:archiveId`：更新存档（Bearer，所有者）
- `DELETE /api/v2/archives/:archiveId`：删除存档（Bearer，所有者）
- `POST /api/v2/archives/:archiveId/scores`：提交成绩（Bearer，所有者）
- `GET /api/v2/maps/:mapId/dimensions`：维度列表（Bearer）
- `GET /api/v2/maps/:mapId/leaderboard/:dimensionId`：排行榜（Bearer，`mode=player|archive`，支持 `page/limit`）
- `GET /api/v2/maps/:mapId/leaderboard/:dimensionId/me`：我的排名（Bearer）
- `GET /api/v2/players/me`：当前玩家信息（Bearer）

### 管理端（Web UI）

- 管理端登录页：`/admin/login`（账号密码登录，服务端设置 `admin_session` Cookie）
- 管理端路由保护：`/maps`、`/players`、`/archives`、`/admin/*` 需要 `admin_session` Cookie
- 地图：列表/详情/创建
- 玩家：列表/详情
- 存档：列表/详情
- 排行榜：查看（默认每玩家最佳；可切换每存档；支持分页）
- **新增（本次）**：地图详情页创建维度
- **新增（本次）**：地图/玩家/存档列表分页（管理端）

## 主要缺口 / 不一致点（建议按优先级迭代）

### P0（会影响运行/稳定性）

- 部署配置未确保容器获得 `ADMIN_USERNAME`、`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET`、`PLAYER_TOKEN_SECRET`（v2 核心鉴权依赖）。
- 健康检查/运维脚本不应调用 v1 或需要鉴权的接口；建议统一使用 `GET /api/health`。

### P1（管理体验/可维护性）

- 已补齐：地图编辑/删除、维度编辑/删除、存档筛选与分页；仍缺批量操作。
- 已补齐：公开排行榜页面 `/leaderboard`。
- 已补齐：管理端“退出登录”入口（清理 `admin_session` Cookie）。

### P2（产品/安全增强）

- `admin_session` cookie 为 httpOnly（更安全），建议生产环境仍配合反向代理/内网隔离使用。
- 视需求决定：是否允许管理员通过 API 读取任意存档（当前管理端直接读 DB，不走 API）。
