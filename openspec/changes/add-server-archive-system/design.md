# 技术设计文档

## Context（背景）

构建一个通用游戏存档管理系统，核心需求：
- 支持多地图管理
- 玩家可在不同地图创建多个存档
- 多维度排行榜（每个地图可定义不同排行维度）
- Docker Compose 一键部署

## Goals / Non-Goals

### Goals
- 提供完整的 RESTful API 供游戏客户端调用
- 支持高效的排行榜查询（分页、按维度筛选）
- 一键 Docker Compose 部署
- 简洁的管理前端界面

### Non-Goals
- 实时推送（WebSocket）
- 用户密码认证（仅用玩家名+ID识别）
- 分布式部署

## 数据库设计

### ER 图

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│    Map      │      │    MapPlayer     │      │   Player    │
├─────────────┤      ├──────────────────┤      ├─────────────┤
│ id (PK)     │─────<│ id (PK)          │>─────│ id (PK)     │
│ name        │      │ mapId (FK)       │      │ playerId    │
│ description │      │ playerId (FK)    │      │ playerName  │
│ config      │      │ joinedAt         │      │ createdAt   │
│ createdAt   │      └──────────────────┘      │ updatedAt   │
└─────────────┘               │                └─────────────┘
                              │
                              ▼
┌─────────────────────┐      ┌──────────────────────┐
│ LeaderboardDimension│      │      Archive         │
├─────────────────────┤      ├──────────────────────┤
│ id (PK)             │      │ id (PK)              │
│ mapId (FK)          │      │ mapPlayerId (FK)     │
│ name                │      │ name                 │
│ unit                │      │ data (JSONB)         │
│ sortOrder (ASC/DESC)│      │ createdAt            │
│ createdAt           │      │ updatedAt            │
└─────────────────────┘      └──────────────────────┘
          │                            │
          │                            │
          ▼                            ▼
┌────────────────────────────────────────────────┐
│              LeaderboardEntry                  │
├────────────────────────────────────────────────┤
│ id (PK)                                        │
│ dimensionId (FK) → LeaderboardDimension        │
│ archiveId (FK) → Archive                       │
│ value (DECIMAL)                                │
│ metadata (JSONB)                               │
│ createdAt                                      │
│ updatedAt                                      │
└────────────────────────────────────────────────┘
```

### Prisma Schema

```prisma
model Player {
  id          String      @id @default(cuid())
  playerId    String      @unique  // 游戏客户端传入的玩家ID
  playerName  String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  mapPlayers  MapPlayer[]
}

model Map {
  id          String      @id @default(cuid())
  name        String
  description String?
  config      Json?       // 地图配置（可选）
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  mapPlayers  MapPlayer[]
  dimensions  LeaderboardDimension[]
}

model MapPlayer {
  id        String    @id @default(cuid())
  map       Map       @relation(fields: [mapId], references: [id], onDelete: Cascade)
  mapId     String
  player    Player    @relation(fields: [playerId], references: [id], onDelete: Cascade)
  playerId  String
  joinedAt  DateTime  @default(now())
  archives  Archive[]

  @@unique([mapId, playerId])
}

model Archive {
  id          String    @id @default(cuid())
  mapPlayer   MapPlayer @relation(fields: [mapPlayerId], references: [id], onDelete: Cascade)
  mapPlayerId String
  name        String
  data        Json      // 存档数据
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  entries     LeaderboardEntry[]
}

model LeaderboardDimension {
  id        String    @id @default(cuid())
  map       Map       @relation(fields: [mapId], references: [id], onDelete: Cascade)
  mapId     String
  name      String    // 如 "分数", "通关时间", "收集品"
  unit      String?   // 如 "分", "秒", "个"
  sortOrder String    @default("DESC") // "ASC" 或 "DESC"
  createdAt DateTime  @default(now())
  entries   LeaderboardEntry[]

  @@unique([mapId, name])
}

model LeaderboardEntry {
  id          String    @id @default(cuid())
  dimension   LeaderboardDimension @relation(fields: [dimensionId], references: [id], onDelete: Cascade)
  dimensionId String
  archive     Archive   @relation(fields: [archiveId], references: [id], onDelete: Cascade)
  archiveId   String
  value       Decimal   @db.Decimal(20, 6)  // 支持大数和小数
  metadata    Json?     // 额外信息
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([dimensionId, archiveId])
  @@index([dimensionId, value])
}
```

## API 设计

### 认证方式

客户端请求头携带：
```
X-Player-ID: <玩家ID>
X-Player-Name: <玩家名>
```

首次请求时自动注册玩家。

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| **地图** |||
| GET | `/api/maps` | 获取所有地图 |
| GET | `/api/maps/:mapId` | 获取地图详情 |
| POST | `/api/maps` | 创建地图（管理） |
| PUT | `/api/maps/:mapId` | 更新地图（管理） |
| DELETE | `/api/maps/:mapId` | 删除地图（管理） |
| **玩家** |||
| GET | `/api/players/me` | 获取当前玩家信息 |
| GET | `/api/maps/:mapId/players` | 获取地图内玩家列表 |
| POST | `/api/maps/:mapId/join` | 加入地图 |
| **存档** |||
| GET | `/api/maps/:mapId/archives` | 获取我在该地图的存档 |
| GET | `/api/archives/:archiveId` | 获取存档详情 |
| POST | `/api/maps/:mapId/archives` | 创建存档 |
| PUT | `/api/archives/:archiveId` | 更新存档 |
| DELETE | `/api/archives/:archiveId` | 删除存档 |
| **排行榜** |||
| GET | `/api/maps/:mapId/dimensions` | 获取地图排行榜维度 |
| POST | `/api/maps/:mapId/dimensions` | 创建排行榜维度（管理） |
| GET | `/api/maps/:mapId/leaderboard/:dimensionId` | 获取排行榜 |
| POST | `/api/archives/:archiveId/scores` | 提交/更新排行榜成绩 |

### 排行榜查询参数

```
GET /api/maps/:mapId/leaderboard/:dimensionId?page=1&limit=20
```

响应：
```json
{
  "dimension": {
    "id": "...",
    "name": "分数",
    "unit": "分",
    "sortOrder": "DESC"
  },
  "entries": [
    {
      "rank": 1,
      "playerName": "玩家A",
      "archiveName": "存档1",
      "value": 9999,
      "updatedAt": "2024-..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## 目录结构

```
ServerArchive/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── maps/
│   │   ├── players/
│   │   ├── archives/
│   │   └── leaderboard/
│   ├── (dashboard)/          # 管理前端
│   │   ├── maps/
│   │   ├── players/
│   │   └── leaderboard/
│   ├── layout.tsx
│   └── page.tsx
├── components/               # React 组件
│   ├── ui/                   # shadcn/ui 组件
│   └── ...
├── lib/                      # 工具函数
│   ├── db.ts                 # Prisma client
│   ├── auth.ts               # 玩家认证
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

## Docker Compose 配置

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/serverarchive
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=serverarchive
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## 部署流程

```bash
# 一键启动
docker-compose up -d

# 首次运行数据库迁移
docker-compose exec app npx prisma migrate deploy

# 查看日志
docker-compose logs -f app
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 无密码认证安全性低 | 适用于信任环境，可后续添加 Token 验证 |
| JSONB 存档可能很大 | 限制单个存档大小，考虑压缩 |
| 排行榜高并发 | 添加索引，必要时引入 Redis 缓存 |

## Open Questions

- 是否需要存档大小限制？建议：10MB
- 是否需要玩家封禁功能？
- 是否需要管理员认证？
