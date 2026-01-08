## ADDED Requirements

### Requirement: 排行榜维度更新与删除 API
系统 SHALL 提供更新与删除排行榜维度的管理接口。

#### Scenario: 更新维度
- **WHEN** 管理员请求 PUT /api/v2/maps/:mapId/dimensions/:dimensionId 并携带 X-Admin-Token
- **THEN** 系统更新维度并返回最新数据

#### Scenario: 删除维度
- **WHEN** 管理员请求 DELETE /api/v2/maps/:mapId/dimensions/:dimensionId 并携带 X-Admin-Token
- **THEN** 系统删除维度并返回 204

#### Scenario: 维度不属于地图
- **WHEN** dimensionId 不存在或不属于 mapId
- **THEN** 返回 404 Not Found
