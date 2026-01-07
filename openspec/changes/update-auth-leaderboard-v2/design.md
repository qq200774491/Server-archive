# 技术设计（v2 切换）

## 1. 认证设计

### 1.1 管理端（Admin）

- Header：`X-Admin-Token: <token>`
- 服务端校验：与 `process.env.ADMIN_TOKEN` 做常量时间比对
- 适用范围：
  - 管理写操作（地图/维度 CRUD、删除等）
  - 管理页面访问（建议引入 `/admin/login`，将 token 存入 cookie，middleware 保护 `/(dashboard)`）

> 说明：浏览器导航请求无法可靠附带自定义 header，因此管理页面层面的保护建议使用 cookie；API 写操作仍使用 `X-Admin-Token`（前端请求时读取 cookie 并填充 header）。

### 1.2 玩家端（Player）

- Header：`Authorization: Bearer <player_token>`
- `player_token` 由服务端签发，内容包含：
  - `playerId`（游戏侧稳定 ID）
  - `playerName`（展示名，可被更新）
  - `iat`（签发时间）
  - 可选 `exp`（过期时间，默认建议 30 天）
- 校验方式：HMAC-SHA256（secret 为 `PLAYER_TOKEN_SECRET`）
- 签发 endpoint（v2）建议：
  - `POST /api/v2/auth/player`：入参 `playerId/playerName`，返回 `player_token`；同时 upsert Player

## 2. 排行榜双口径查询

### 2.1 路由与参数

- `GET /api/v2/maps/:mapId/leaderboard/:dimensionId`
  - `mode=player|archive`（默认 `player`）
  - `page`/`limit`

### 2.2 口径定义

- `mode=archive`：保持现有逻辑（每个 `LeaderboardEntry` 对应一个 `archiveId`）
- `mode=player`：每个玩家取“最好成绩”一条：
  - DESC（高分优先）：`MAX(value)` 为最佳
  - ASC（低分/时间越短越好）：`MIN(value)` 为最佳
  - 同值 tie-break：`updatedAt` 更早/更晚需明确（建议：以 `LeaderboardEntry.updatedAt DESC` 选最新成绩）

### 2.3 实现建议

Prisma 对“按玩家分组取最佳行”支持有限，建议使用 `prisma.$queryRaw` + Postgres 窗口函数：
- 先按 player 分组选择最佳 entry（`row_number() over (partition by playerId order by value, updatedAt)`）
- 再对结果集做全局排序并分页
- “我的排名”可复用同一派生表，计算目标玩家在派生榜单中的 rank

## 3. API 版本策略

- v2 为唯一可用对外接口
- v1 路由保留文件但统一返回 410（可选），避免旧链接误用且给出迁移提示

