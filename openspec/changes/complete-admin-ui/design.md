## Context
- 管理端缺少地图/维度编辑与删除入口
- 存档列表缺少筛选与 limit 控制
- /leaderboard 被 middleware 保护，公开访问被阻断

## Goals / Non-Goals
- Goals:
  - 补齐地图编辑/删除与维度编辑/删除
  - 提供存档筛选与 limit 选择
  - 提供公开排行榜页，并保留管理端榜单
  - 增加退出登录入口
- Non-Goals:
  - 不引入新的认证机制或复杂 RBAC
  - 不改动现有数据模型
  - 不新增外部依赖

## Decisions
- /leaderboard 作为公开页面，仅展示每玩家最佳成绩
- 管理端排行榜迁移到 /admin/leaderboard，并继续支持 mode=player|archive
- 存档筛选通过 GET 参数实现，时间范围默认基于 updatedAt
- 编辑/删除使用简单内联表单与确认对话，避免引入新 UI 组件依赖

## Risks / Trade-offs
- 旧的 /leaderboard 书签将变为公开页，管理功能迁移到新路径
- 公开页直接服务端查询数据库，未引入额外缓存

## Migration Plan
- 发布后通过导航入口引导管理端使用 /admin/leaderboard

## Open Questions
- None
