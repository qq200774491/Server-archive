# 项目配置

> 这是让 AI 理解你项目的关键文件。填写越详细，AI 的方案越准确。

## 项目用途

ServerArchive 是一个通用游戏存档管理系统，提供：
- 多地图管理：支持多个游戏地图/关卡
- 玩家存档：玩家可在不同地图创建和管理多个存档
- 多维度排行榜：每个地图可定义多种排行榜（分数、时间等）
- 一键部署：Docker Compose 快速部署

面向游戏开发者，为游戏提供云端存档和排行榜后端服务。

## 技术栈

- **语言**：TypeScript
- **框架**：Next.js 14+ (App Router)
- **数据库**：PostgreSQL
- **ORM**：Prisma
- **UI**：Tailwind CSS + shadcn/ui
- **部署**：Docker Compose

## 代码规范

- 使用 ESLint + Prettier
- 函数命名使用 camelCase
- React 组件使用 PascalCase
- API 路由使用 RESTful 风格
- 类型优先：所有函数参数和返回值需要类型注解

## 领域知识

核心概念：
- **Map（地图）**：游戏中的关卡或场景，可包含多个排行榜维度
- **Player（玩家）**：通过 playerId + playerName 识别，无密码
- **MapPlayer（地图玩家）**：玩家与地图的关联关系
- **Archive（存档）**：玩家在特定地图的游戏进度数据（JSON 格式）
- **LeaderboardDimension（排行榜维度）**：地图中的排行榜类型（如分数、时间）
- **LeaderboardEntry（排行榜记录）**：存档在某维度的成绩

数据层级：
```
地图 (Map)
  └── 排行榜维度 (LeaderboardDimension)
  └── 地图玩家 (MapPlayer)
        └── 存档 (Archive)
              └── 排行榜记录 (LeaderboardEntry)
```

## 约束条件

- 无用户密码认证，仅通过请求头 X-Player-ID 和 X-Player-Name 识别
- 存档数据存储在 PostgreSQL JSONB 字段
- 单个存档大小建议限制 10MB
- API 需支持 CORS 供游戏客户端调用
- 必须支持 Docker Compose 一键部署

## 任务 ID 前缀

- INIT-（初始化任务）
- DB-（数据库任务）
- API-（后端 API 任务）
- FE-（前端页面任务）
- UI-（UI 组件任务）
- DEPLOY-（部署任务）
- TEST-（测试任务）
