## ADDED Requirements

### Requirement: PostgreSQL 数据库

系统 SHALL 使用 PostgreSQL 作为主数据库。

#### Scenario: 数据库连接
- **WHEN** 应用启动
- **THEN** 成功连接到 PostgreSQL 数据库
- **AND** Prisma Client 初始化完成

#### Scenario: 数据库迁移
- **WHEN** 执行 `prisma migrate deploy`
- **THEN** 数据库 schema 更新到最新版本
- **AND** 现有数据得到保留

---

### Requirement: Player 数据模型

系统 SHALL 存储玩家基本信息。

#### Scenario: 玩家记录创建
- **WHEN** 新玩家首次访问
- **THEN** 创建 Player 记录
- **AND** playerId 字段唯一约束

#### Scenario: 玩家字段
- **WHEN** 查询 Player 表
- **THEN** 包含以下字段：
  - id (主键)
  - playerId (唯一，游戏客户端传入)
  - playerName (玩家显示名)
  - createdAt (创建时间)
  - updatedAt (更新时间)

---

### Requirement: Map 数据模型

系统 SHALL 存储地图信息。

#### Scenario: 地图记录
- **WHEN** 查询 Map 表
- **THEN** 包含以下字段：
  - id (主键)
  - name (地图名称)
  - description (可选描述)
  - config (JSON，可选配置)
  - createdAt (创建时间)
  - updatedAt (更新时间)

#### Scenario: 地图删除级联
- **WHEN** 删除一个地图
- **THEN** 关联的 MapPlayer、Archive、LeaderboardDimension 记录一并删除

---

### Requirement: MapPlayer 数据模型

系统 SHALL 存储玩家与地图的关联关系。

#### Scenario: 玩家地图关联
- **WHEN** 查询 MapPlayer 表
- **THEN** 包含以下字段：
  - id (主键)
  - mapId (外键 → Map)
  - playerId (外键 → Player)
  - joinedAt (加入时间)

#### Scenario: 唯一约束
- **WHEN** 同一玩家尝试再次加入同一地图
- **THEN** 返回现有记录而非重复创建
- **AND** mapId + playerId 组合唯一

---

### Requirement: Archive 数据模型

系统 SHALL 存储玩家存档数据。

#### Scenario: 存档记录
- **WHEN** 查询 Archive 表
- **THEN** 包含以下字段：
  - id (主键)
  - mapPlayerId (外键 → MapPlayer)
  - name (存档名称)
  - data (JSON，存档数据)
  - createdAt (创建时间)
  - updatedAt (更新时间)

#### Scenario: 存档删除级联
- **WHEN** 删除一个存档
- **THEN** 关联的 LeaderboardEntry 记录一并删除

---

### Requirement: LeaderboardDimension 数据模型

系统 SHALL 存储排行榜维度配置。

#### Scenario: 维度记录
- **WHEN** 查询 LeaderboardDimension 表
- **THEN** 包含以下字段：
  - id (主键)
  - mapId (外键 → Map)
  - name (维度名称，如 "分数")
  - unit (单位，如 "分")
  - sortOrder (排序方式：ASC 或 DESC)
  - createdAt (创建时间)

#### Scenario: 维度唯一约束
- **WHEN** 在同一地图创建同名维度
- **THEN** 返回错误
- **AND** mapId + name 组合唯一

---

### Requirement: LeaderboardEntry 数据模型

系统 SHALL 存储排行榜成绩记录。

#### Scenario: 成绩记录
- **WHEN** 查询 LeaderboardEntry 表
- **THEN** 包含以下字段：
  - id (主键)
  - dimensionId (外键 → LeaderboardDimension)
  - archiveId (外键 → Archive)
  - value (Decimal，成绩数值)
  - metadata (JSON，可选额外信息)
  - createdAt (创建时间)
  - updatedAt (更新时间)

#### Scenario: 成绩唯一约束
- **WHEN** 同一存档在同一维度提交成绩
- **THEN** 更新现有记录而非重复创建
- **AND** dimensionId + archiveId 组合唯一

#### Scenario: 排行榜查询优化
- **WHEN** 查询排行榜
- **THEN** 使用 (dimensionId, value) 复合索引
- **AND** 查询性能满足要求
