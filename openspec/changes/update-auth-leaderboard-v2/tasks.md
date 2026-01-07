# Implementation Tasks（v2 全量切换）

## 1. 数据库与部署闭环

- [ ] 1.1 生成并提交初始迁移（补齐 `prisma/migrations/*`，确保 `prisma migrate deploy` 可用）
- [ ] 1.2 统一脚本/README：生产走 `migrate deploy`，本地走 `migrate dev`

## 2. v2 认证

- [ ] 2.1 新增 `ADMIN_TOKEN`、`PLAYER_TOKEN_SECRET` 环境变量与 `.env.example` 更新
- [ ] 2.2 实现 Admin 校验工具（`X-Admin-Token`）
- [ ] 2.3 实现 Player Bearer token 的签发与校验
- [ ] 2.4 新增 `POST /api/v2/auth/player`（upsert Player + 返回 token）

## 3. v2 API 路由迁移

- [ ] 3.1 新增 `/api/v2/*` 下的 maps/players/archives/dimensions/scores 路由（全部使用 v2 认证）
- [ ] 3.2 实现 CORS（含 `OPTIONS` 预检）覆盖 `/api/v2/*`
- [ ] 3.3 将旧 `/api/*` 标记不可用（移除或返回 410 + 迁移信息）

## 4. 排行榜双口径 + 我的排名

- [ ] 4.1 `GET /api/v2/maps/:mapId/leaderboard/:dimensionId` 支持 `mode=player|archive`
- [ ] 4.2 `GET /api/v2/maps/:mapId/leaderboard/:dimensionId/me`
- [ ] 4.3 明确 tie-break 规则并写入 README

## 5. 管理端适配（最小可用）

- [ ] 5.1 新增 `/admin/login`（录入 token，写入 cookie）
- [ ] 5.2 middleware 保护 `/(dashboard)`（未登录跳转 `/admin/login`）
- [ ] 5.3 管理写操作走 v2 API（自动带 `X-Admin-Token`）
- [ ] 5.4 修复断链：补齐 `/maps/new`

## Validation

- [ ] `docker-compose up -d` + migrate profile 可成功启动并可访问
- [ ] v2 API：401/403/404、分页、CORS 预检均符合预期
- [ ] leaderboard：`mode=player` 与 `mode=archive` 结果正确，“我的排名”正确
- [ ] 管理端未登录不可访问 dashboard

