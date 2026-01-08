# Implementation Tasks

## 1. API
- [x] 1.1 新增 PUT /api/v2/maps/:mapId/dimensions/:dimensionId
- [x] 1.2 新增 DELETE /api/v2/maps/:mapId/dimensions/:dimensionId
- [x] 1.3 校验维度归属与输入参数，返回 400/404/204

## 2. Middleware 与路由
- [x] 2.1 middleware 保护 /admin/*（排除 /admin/login），移除 /leaderboard 保护
- [x] 2.2 管理端榜单迁移到 /admin/leaderboard
- [x] 2.3 新增公开排行榜页 /leaderboard

## 3. 前端 UI
- [x] 3.1 地图详情增加编辑表单与删除入口
- [x] 3.2 维度列表增加编辑/删除操作
- [x] 3.3 存档列表增加筛选（地图/玩家/存档名/时间范围）与 limit 选择
- [x] 3.4 管理端 header 增加退出登录按钮
- [x] 3.5 导航链接调整到 /admin/leaderboard

## Validation
- [ ] /leaderboard 可公开访问，/admin/leaderboard 需 admin cookie
- [ ] 地图与维度编辑/删除通过 UI 正常工作
- [ ] 存档筛选与 limit 生效
