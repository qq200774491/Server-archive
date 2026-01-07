# Change: 全量切换到 v2（认证 + 排行榜双口径 + 我的排名）

## Why（为什么）

当前系统的玩家端认证依赖 `X-Player-ID / X-Player-Name` 请求头，难以在真实客户端中安全、稳定地复用；同时管理端缺少强制鉴权，存在任意用户可写入地图/维度的风险。

排行榜需求升级为“双口径”：
- **对外**：每个玩家只展示最好成绩（更符合玩家视角）
- **内部**：保留每个存档一条（便于管理、排障与审计）

此外需要提供“我的排名”单独接口，便于客户端快速查询个人名次。

## What Changes（改什么）

1. **全量切换到 v2 API**
   - 新增 `/api/v2/*` 路由并作为唯一对外接口
   - 旧 `/api/*`（v1）移除或返回明确错误（如 410）

2. **认证机制变更**
   - **管理端**：`X-Admin-Token`（与环境变量 `ADMIN_TOKEN` 比对）
   - **玩家端**：`Authorization: Bearer <player_token>`（由服务端签发/验证）

3. **排行榜双口径**
   - `mode=player`：每玩家最佳一条（默认）
   - `mode=archive`：每存档一条（内部/管理用）

4. **“我的排名”单独 endpoint**
   - `GET /api/v2/maps/:mapId/leaderboard/:dimensionId/me`

## Impact（影响范围）

- **Breaking change**：客户端与管理端必须升级到 v2（旧鉴权与旧路径不再可用）
- 影响模块：
  - API 路由：认证、排行榜查询、排行榜提交、CORS
  - 管理端页面：需要管理登录/持久化 token，并避免未鉴权访问
  - 文档：README 的示例与鉴权说明

## Non-Goals（非目标）

- 不引入复杂 RBAC，仅提供“管理员 token / 玩家 token”两类身份
- 不引入 WebSocket/实时推送
- 不引入第三方 OAuth

