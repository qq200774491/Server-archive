## ADDED Requirements

### Requirement: RESTful API 服务

系统 SHALL 提供 RESTful API 供游戏客户端和管理前端调用。

#### Scenario: API 基础访问
- **WHEN** 客户端发送 HTTP 请求到 `/api/*` 端点
- **THEN** 服务器返回 JSON 格式响应
- **AND** 响应包含正确的 HTTP 状态码

#### Scenario: 跨域请求支持
- **WHEN** 客户端从不同域名发送请求
- **THEN** 服务器返回正确的 CORS 头
- **AND** 允许预检请求通过

---

### Requirement: 玩家身份认证

系统 SHALL 通过请求头识别玩家身份，无需密码。

#### Scenario: 玩家身份识别
- **WHEN** 请求包含 `X-Player-ID` 和 `X-Player-Name` 头
- **THEN** 系统识别或自动创建该玩家
- **AND** 后续操作关联到该玩家

#### Scenario: 缺少身份信息
- **WHEN** 请求缺少必要的身份头
- **THEN** 系统返回 401 Unauthorized
- **AND** 响应包含错误说明

---

### Requirement: 地图管理 API

系统 SHALL 提供地图的 CRUD 操作接口。

#### Scenario: 获取地图列表
- **WHEN** GET `/api/maps`
- **THEN** 返回所有地图列表
- **AND** 每个地图包含 id、name、description

#### Scenario: 获取地图详情
- **WHEN** GET `/api/maps/:mapId`
- **THEN** 返回指定地图的完整信息
- **AND** 包含关联的排行榜维度

#### Scenario: 创建地图
- **WHEN** POST `/api/maps` 带有效 body
- **THEN** 创建新地图并返回
- **AND** HTTP 状态码为 201

#### Scenario: 更新地图
- **WHEN** PUT `/api/maps/:mapId` 带有效 body
- **THEN** 更新地图信息并返回
- **AND** HTTP 状态码为 200

#### Scenario: 删除地图
- **WHEN** DELETE `/api/maps/:mapId`
- **THEN** 删除地图及其关联数据
- **AND** HTTP 状态码为 204

---

### Requirement: 玩家信息 API

系统 SHALL 提供玩家信息查询接口。

#### Scenario: 获取当前玩家
- **WHEN** GET `/api/players/me`
- **THEN** 返回当前认证玩家的信息
- **AND** 包含玩家参与的地图列表

#### Scenario: 获取地图玩家列表
- **WHEN** GET `/api/maps/:mapId/players`
- **THEN** 返回该地图中所有玩家
- **AND** 支持分页参数

#### Scenario: 加入地图
- **WHEN** POST `/api/maps/:mapId/join`
- **THEN** 将当前玩家加入该地图
- **AND** 如果已加入则返回现有记录

---

### Requirement: 存档管理 API

系统 SHALL 提供存档的 CRUD 操作接口。

#### Scenario: 获取我的存档列表
- **WHEN** GET `/api/maps/:mapId/archives`
- **THEN** 返回当前玩家在该地图的所有存档
- **AND** 按更新时间倒序

#### Scenario: 获取存档详情
- **WHEN** GET `/api/archives/:archiveId`
- **THEN** 返回存档完整数据
- **AND** 包含关联的排行榜成绩

#### Scenario: 创建存档
- **WHEN** POST `/api/maps/:mapId/archives` 带有效 body
- **THEN** 创建新存档
- **AND** 自动关联到当前玩家在该地图的记录

#### Scenario: 更新存档
- **WHEN** PUT `/api/archives/:archiveId` 带有效 body
- **THEN** 更新存档数据
- **AND** 更新 updatedAt 时间戳

#### Scenario: 删除存档
- **WHEN** DELETE `/api/archives/:archiveId`
- **THEN** 删除存档及其排行榜记录
- **AND** HTTP 状态码为 204

---

### Requirement: 排行榜 API

系统 SHALL 提供排行榜查询和成绩提交接口。

#### Scenario: 获取排行榜维度
- **WHEN** GET `/api/maps/:mapId/dimensions`
- **THEN** 返回该地图的所有排行榜维度
- **AND** 每个维度包含 name、unit、sortOrder

#### Scenario: 创建排行榜维度
- **WHEN** POST `/api/maps/:mapId/dimensions` 带有效 body
- **THEN** 创建新的排行榜维度
- **AND** HTTP 状态码为 201

#### Scenario: 获取排行榜数据
- **WHEN** GET `/api/maps/:mapId/leaderboard/:dimensionId`
- **THEN** 返回该维度的排行榜
- **AND** 按 sortOrder 排序
- **AND** 支持分页参数 (page, limit)

#### Scenario: 提交排行榜成绩
- **WHEN** POST `/api/archives/:archiveId/scores` 带有效 body
- **THEN** 创建或更新该存档的排行榜成绩
- **AND** 返回更新后的成绩信息
