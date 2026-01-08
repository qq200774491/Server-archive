## ADDED Requirements

### Requirement: 地图编辑与删除操作
系统 SHALL 在地图详情页提供编辑与删除操作。

#### Scenario: 管理员更新地图信息
- **WHEN** 管理员在地图详情页提交名称/描述修改
- **THEN** 系统更新地图信息并刷新展示

#### Scenario: 管理员删除地图
- **WHEN** 管理员在地图详情页确认删除地图
- **THEN** 系统删除地图并返回地图列表

---

### Requirement: 排行榜维度编辑与删除
系统 SHALL 在地图详情页提供排行榜维度的编辑与删除操作。

#### Scenario: 管理员更新维度
- **WHEN** 管理员修改维度名称/单位/排序并提交
- **THEN** 系统更新维度并刷新列表

#### Scenario: 管理员删除维度
- **WHEN** 管理员确认删除维度
- **THEN** 系统删除维度并刷新列表

---

### Requirement: 存档列表筛选与 limit
系统 SHALL 在存档列表提供筛选与 limit 控制。

#### Scenario: 筛选存档列表
- **WHEN** 管理员按地图/玩家/存档名/时间范围筛选
- **THEN** 仅展示符合条件的存档记录

#### Scenario: 调整分页大小
- **WHEN** 管理员选择不同的 limit
- **THEN** 列表按新的分页大小返回

---

### Requirement: 退出登录入口
系统 SHALL 提供退出登录入口清理 admin_token cookie。

#### Scenario: 管理员退出登录
- **WHEN** 管理员点击退出登录
- **THEN** 系统清理 admin_token 并跳转到登录页

---

### Requirement: 公开排行榜页面
系统 SHALL 提供公开排行榜页面与独立的管理端排行榜页面。

#### Scenario: 公开排行榜访问
- **WHEN** 访问 /leaderboard
- **THEN** 无需管理员 cookie 即可查看排行榜
- **AND** 默认展示每玩家最佳成绩

#### Scenario: 管理端排行榜访问
- **WHEN** 管理员访问 /admin/leaderboard
- **THEN** 需要管理员 cookie
- **AND** 支持 mode=player|archive 切换
