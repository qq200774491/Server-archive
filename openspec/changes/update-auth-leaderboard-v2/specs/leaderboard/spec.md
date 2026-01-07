## MODIFIED Requirements

### Requirement: 排行榜双口径（mode）

系统 SHALL 支持 `mode=player|archive` 两种排行榜口径。

#### Scenario: 对外默认每玩家最好一条
- **WHEN** 查询排行榜且未指定 mode
- **THEN** 使用 `mode=player`
- **AND** 每个玩家最多返回一条记录（其最佳成绩）

#### Scenario: 内部按存档返回
- **WHEN** 查询排行榜指定 `mode=archive`
- **THEN** 返回每存档一条记录

---

### Requirement: 我的排名（独立 endpoint）

系统 SHALL 提供单独 endpoint 查询当前玩家在某维度的排名。

#### Scenario: 查询我的排名
- **WHEN** 玩家请求 `GET /api/v2/maps/:mapId/leaderboard/:dimensionId/me`
- **THEN** 返回玩家在 `mode=player` 口径下的 rank 与成绩详情

#### Scenario: 玩家无成绩
- **WHEN** 玩家在该维度没有成绩
- **THEN** 返回 null 或空结果
- **AND** HTTP 状态码为 200

