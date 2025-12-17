# Change: 添加游戏存档管理系统

## Why（为什么）

需要一个通用的游戏存档管理平台，支持多地图、多玩家存档管理和多维度排行榜功能，并提供 Docker Compose 一键部署能力。

## What Changes（改什么）

- 创建 Next.js 全栈应用（前端 + API Routes）
- 设计 PostgreSQL 数据库架构（地图、玩家、存档、排行榜）
- 实现玩家身份验证（客户端传入玩家名 + 玩家ID，无密码）
- 实现多维度排行榜系统（支持分数、时间等多种排行）
- 提供 Docker Compose 一键部署配置
- 提供 RESTful API 供游戏客户端调用

## Impact（影响范围）

- 影响的规格：新建项目，无现有规格影响
- 影响的代码：
  - `/app` - Next.js 应用目录
  - `/prisma` - 数据库 schema 和迁移
  - `/docker` - Docker 配置
  - `/docs` - API 文档

## 核心数据模型

```
地图 (Map)
  └── 玩家在地图的记录 (MapPlayer)
        └── 存档 (Archive)
              └── 排行榜记录 (LeaderboardEntry)
```

## 排行榜维度

- 每个地图可定义多个排行榜维度（如：分数、通关时间、收集品数量）
- 玩家的每个存档可以有多个排行榜成绩
- 支持全服排行和地图内排行

## 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 14+ (App Router) | 全栈一体，SSR/API 统一 |
| 数据库 | PostgreSQL | 复杂查询、排行榜性能好 |
| ORM | Prisma | 类型安全，迁移方便 |
| UI | Tailwind CSS + shadcn/ui | 快速开发，美观 |
| 部署 | Docker Compose | 一键部署，包含 PG |

## 非目标（Not Goals）

- 不包含游戏本体逻辑
- 不包含实时通信（WebSocket）
- 不包含付费/商城功能
