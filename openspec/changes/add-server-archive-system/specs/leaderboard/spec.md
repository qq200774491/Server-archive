## ADDED Requirements

### Requirement: 多维度排行榜

系统 SHALL 支持每个地图定义多个排行榜维度。

#### Scenario: 创建排行榜维度
- **WHEN** 为地图创建排行榜维度
- **THEN** 指定维度名称（如 "分数"、"通关时间"）
- **AND** 指定单位（如 "分"、"秒"）
- **AND** 指定排序方式（ASC 时间越短越好，DESC 分数越高越好）

#### Scenario: 维度独立性
- **WHEN** 查询某个维度的排行榜
- **THEN** 只返回该维度的成绩
- **AND** 不影响其他维度

---

### Requirement: 成绩提交

系统 SHALL 支持存档提交排行榜成绩。

#### Scenario: 提交新成绩
- **WHEN** 存档首次提交某维度成绩
- **THEN** 创建 LeaderboardEntry 记录
- **AND** 记录关联到存档和维度

#### Scenario: 更新成绩
- **WHEN** 存档再次提交同一维度成绩
- **THEN** 更新现有记录的 value
- **AND** 更新 updatedAt 时间戳

#### Scenario: 批量提交
- **WHEN** 一次请求提交多个维度成绩
- **THEN** 所有维度成绩一并更新
- **AND** 使用事务保证原子性

---

### Requirement: 排行榜查询

系统 SHALL 提供高效的排行榜查询功能。

#### Scenario: 排行榜分页
- **WHEN** 查询排行榜带分页参数
- **THEN** 返回指定页的数据
- **AND** 返回总条数信息

#### Scenario: 排行榜排序
- **WHEN** 维度 sortOrder 为 DESC
- **THEN** 按 value 降序排列（高分在前）
- **WHEN** 维度 sortOrder 为 ASC
- **THEN** 按 value 升序排列（低分/短时间在前）

#### Scenario: 排行榜数据结构
- **WHEN** 返回排行榜数据
- **THEN** 每条记录包含：
  - rank (排名)
  - playerName (玩家名)
  - playerId (玩家ID)
  - archiveName (存档名)
  - archiveId (存档ID)
  - value (成绩数值)
  - updatedAt (更新时间)

---

### Requirement: 玩家排名查询

系统 SHALL 支持查询特定玩家的排名。

#### Scenario: 我的排名
- **WHEN** 玩家查询自己在某维度的排名
- **THEN** 返回玩家最好成绩的排名
- **AND** 返回成绩详情

#### Scenario: 无成绩情况
- **WHEN** 玩家在某维度没有成绩
- **THEN** 返回 null 或空结果
- **AND** 不报错
