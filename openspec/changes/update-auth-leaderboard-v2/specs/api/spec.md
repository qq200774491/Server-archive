## MODIFIED Requirements

### Requirement: API 版本与路径（v2 Only）

系统 SHALL 仅对外提供 `/api/v2/*` API；旧 `/api/*` 不再可用。

#### Scenario: v2 路径可访问
- **WHEN** 客户端请求 `/api/v2/*`
- **THEN** 返回 JSON 格式响应

#### Scenario: v1 路径不可用
- **WHEN** 客户端请求旧 `/api/*`
- **THEN** 返回 410 Gone（或 404）
- **AND** 响应包含迁移提示

---

### Requirement: 管理端认证（Admin Token）

系统 SHALL 使用 `X-Admin-Token` 保护管理写操作。

#### Scenario: 管理写操作需要 Admin Token
- **WHEN** 请求为管理写操作（如创建/更新/删除地图或维度）
- **AND** 请求头缺少 `X-Admin-Token`
- **THEN** 返回 401 Unauthorized

#### Scenario: Admin Token 错误
- **WHEN** `X-Admin-Token` 与 `ADMIN_TOKEN` 不匹配
- **THEN** 返回 403 Forbidden

---

### Requirement: 玩家端认证（Bearer Token）

系统 SHALL 使用 `Authorization: Bearer <player_token>` 识别玩家身份。

#### Scenario: 玩家请求需要 Bearer
- **WHEN** 玩家端请求需要玩家身份的 API
- **AND** 缺少/无效 Bearer Token
- **THEN** 返回 401 Unauthorized

#### Scenario: Bearer Token 解析成功并自动 upsert 玩家
- **WHEN** Bearer Token 合法且包含 playerId/playerName
- **THEN** 系统识别或自动创建该玩家
- **AND** 后续操作关联到该玩家

---

### Requirement: CORS（v2）

系统 SHALL 对 `/api/v2/*` 返回正确的 CORS 头并支持预检。

#### Scenario: CORS 预检请求
- **WHEN** 浏览器对 `/api/v2/*` 发起 `OPTIONS` 预检
- **THEN** 返回允许的 `Access-Control-*` 头
- **AND** HTTP 状态码为 204（或 200）

