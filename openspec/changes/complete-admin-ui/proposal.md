# Change: 补齐管理端 UI 与公开排行榜

## Why
当前管理端缺失地图/维度的完整管理入口，存档列表缺少筛选与 limit 控制，同时无明确的退出登录入口。
/leaderboard 目前被 middleware 保护，导致公开排行榜无法访问。

## What Changes
- 增加地图编辑/删除 UI，调用 v2 PUT/DELETE
- 新增排行榜维度 PUT/DELETE 接口，并补齐编辑/删除 UI
- 存档列表增加筛选（地图/玩家/存档名/时间范围）与 limit 选择
- 管理端新增退出登录入口，清理 admin_token cookie
- /leaderboard 作为公开排行榜；管理端排行榜迁移至 /admin/leaderboard
- 更新 middleware 与导航链接适配新路由

## Impact
- Affected specs: frontend, api
- Affected code: src/app/(dashboard), src/app/leaderboard, src/app/api/v2, src/components, src/middleware.ts
- Behavior: /leaderboard 不再需要管理员 cookie，管理员榜单路径调整为 /admin/leaderboard
