# Server Archive

游戏存档管理系统 - 多地图、多玩家、多维度排行榜

## 功能特性

- **地图管理**: 创建和管理多个游戏地图
- **玩家系统**: 自动注册玩家，支持跨地图
- **存档管理**: 玩家可在每个地图创建多个存档
- **多维度排行榜**: 每个地图支持多种排行榜（分数、时间等）
- **RESTful API**: 完整的 API 供游戏客户端调用
- **管理前端**: Web 界面管理地图、玩家、存档和排行榜

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **部署**: Docker Compose

## 快速开始

### Docker Compose 一键部署（推荐）

```bash
# 克隆仓库
git clone https://github.com/qq200774491/Server-archive.git
cd Server-archive

# 启动服务
docker-compose up -d

# 运行数据库迁移（首次部署）
docker-compose --profile migrate up migrate

# 访问
open http://localhost:3000
```

### 裸 Linux 服务器“一键部署 + 冒烟测试”（root / sudo）

要求较新的 Linux 发行版（例如 Ubuntu 20.04+/Debian 11+/CentOS 7+/Rocky 8+）。CentOS 6 / RHEL 6 无法运行本项目所需的 Node/Prisma 或 Docker 运行时。

```bash
curl -fsSL https://raw.githubusercontent.com/qq200774491/Server-archive/master/scripts/deploy-oneclick.sh | sudo bash
```

可选参数：
- 指定仓库/分支：`REPO_URL=... BRANCH=...`
- 指定安装目录：`APP_DIR=/opt/server-archive`
- 指定冒烟测试 URL：`APP_URL=http://localhost:3000`

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 DATABASE_URL

# 数据库迁移
npm run db:migrate

# 运行种子数据（可选）
npm run db:seed

# 启动开发服务器
npm run dev
```

## API 文档

### 认证方式

本项目已全量切换到 **v2 API**：`/api/v2/*`。

**玩家端（游戏客户端）**
- 先请求 `POST /api/v2/auth/player` 获取 `token`
- 后续请求携带：`Authorization: Bearer <token>`

**管理端（后台）**
- 需要携带：`X-Admin-Token: <ADMIN_TOKEN>`
- 管理 UI 访问需先到 `/admin/login` 输入 token

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| **认证** |||
| POST | `/api/v2/auth/player` | 签发玩家 token（并自动注册/更新玩家） |
| **地图** |||
| GET | `/api/v2/maps` | 获取所有地图（Bearer） |
| GET | `/api/v2/maps/:mapId` | 获取地图详情（Bearer） |
| POST | `/api/v2/maps` | 创建地图（Admin） |
| PUT | `/api/v2/maps/:mapId` | 更新地图（Admin） |
| DELETE | `/api/v2/maps/:mapId` | 删除地图（Admin） |
| **玩家** |||
| GET | `/api/v2/players/me` | 获取当前玩家信息（Bearer） |
| GET | `/api/v2/maps/:mapId/players` | 获取地图内玩家列表（Bearer） |
| POST | `/api/v2/maps/:mapId/join` | 加入地图（Bearer） |
| **存档** |||
| GET | `/api/v2/maps/:mapId/archives` | 获取我在该地图的存档（Bearer） |
| GET | `/api/v2/archives/:archiveId` | 获取存档详情（Bearer） |
| POST | `/api/v2/maps/:mapId/archives` | 创建存档（Bearer） |
| PUT | `/api/v2/archives/:archiveId` | 更新存档（Bearer） |
| DELETE | `/api/v2/archives/:archiveId` | 删除存档（Bearer） |
| **排行榜** |||
| GET | `/api/v2/maps/:mapId/dimensions` | 获取地图排行榜维度（Bearer） |
| POST | `/api/v2/maps/:mapId/dimensions` | 创建排行榜维度（Admin） |
| GET | `/api/v2/maps/:mapId/leaderboard/:dimensionId` | 获取排行榜（Bearer，默认每玩家最佳；`mode=archive` 为每存档） |
| GET | `/api/v2/maps/:mapId/leaderboard/:dimensionId/me` | 获取我的排名（Bearer，独立 endpoint） |
| POST | `/api/v2/archives/:archiveId/scores` | 提交排行榜成绩（Bearer） |

### 示例请求

#### 获取玩家 token

```bash
curl -X POST http://localhost:3000/api/v2/auth/player \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-001","playerName":"测试玩家"}'
```

#### 创建存档

```bash
curl -X POST http://localhost:3000/api/v2/maps/map-001/archives \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "存档1", "data": {"level": 5, "coins": 1000}}'
```

#### 提交排行榜成绩

```bash
curl -X POST http://localhost:3000/api/v2/archives/archive-id/scores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"scores": [{"dimensionId": "dim-id", "value": 9999}]}'
```

## 数据模型

```
地图 (Map)
  └── 排行榜维度 (LeaderboardDimension)
  └── 地图玩家 (MapPlayer)
        └── 存档 (Archive)
              └── 排行榜记录 (LeaderboardEntry)
```

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | - |
| `NEXT_PUBLIC_APP_URL` | 应用 URL | `http://localhost:3000` |

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码检查
npm run db:generate  # 生成 Prisma Client
npm run db:push      # 推送 schema 到数据库
npm run db:migrate   # 运行数据库迁移
npm run db:seed      # 运行种子数据
```

## License

MIT
