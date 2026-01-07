# ServerArchive 交付文档

> 生成时间：2024-12-17
> OpenSpec 变更：add-server-archive-system

---

## 完成内容摘要

### Wave 1: 项目初始化 (INIT-01)
- Next.js 14+ 项目初始化 (App Router + TypeScript)
- Tailwind CSS 配置
- Prisma ORM 配置
- ESLint 配置
- 环境变量模板 (.env.example)

### Wave 2: 数据库 + UI 组件
**DB-01 数据库层**
- 完整的 Prisma Schema (6 个模型)
- Prisma Client 封装 (lib/db.ts)
- 种子数据脚本 (prisma/seed.ts)

**UI-01 UI组件库**
- shadcn/ui 风格组件 (Button, Card, Table, Input, Label, Badge, Skeleton)
- 主导航组件 (nav.tsx)
- 分页组件 (pagination.tsx)
- 仪表盘布局

### Wave 3: API 实现
**API-01 地图模块**
- GET/POST `/api/maps` - 地图列表和创建
- GET/PUT/DELETE `/api/maps/:mapId` - 地图详情、更新、删除

**API-02 玩家模块**
- GET `/api/players/me` - 当前玩家信息
- GET `/api/maps/:mapId/players` - 地图玩家列表
- POST `/api/maps/:mapId/join` - 加入地图

**API-03 存档模块**
- GET/POST `/api/maps/:mapId/archives` - 存档列表和创建
- GET/PUT/DELETE `/api/archives/:archiveId` - 存档详情、更新、删除

**API-04 排行榜模块**
- GET/POST `/api/maps/:mapId/dimensions` - 排行榜维度
- GET `/api/maps/:mapId/leaderboard/:dimensionId` - 排行榜数据
- POST `/api/archives/:archiveId/scores` - 提交成绩

### Wave 4: 前端页面
- 地图管理页面 (/maps, /maps/:id)
- 玩家列表页面 (/players, /players/:id)
- 存档管理页面 (/archives, /archives/:id)
- 排行榜页面 (/leaderboard)

### Wave 5: Docker 部署
- Dockerfile (多阶段构建)
- docker-compose.yml (app + PostgreSQL)
- .dockerignore
- README.md 部署说明

---

## 测试指南

### 本地开发测试

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，设置 DATABASE_URL

# 3. 启动 PostgreSQL（如使用本地数据库）
# 或使用 Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16

# 4. 数据库迁移
npm run db:migrate

# 5. 运行种子数据（可选）
npm run db:seed

# 6. 启动开发服务器
npm run dev

# 7. 访问 http://localhost:3000
```

### Docker 部署测试

```bash
# 1. 启动服务
docker-compose up -d

# 2. 运行数据库迁移
docker-compose --profile migrate up migrate

# 3. 访问 http://localhost:3000
```

### API 测试

```bash
# 创建地图
curl -X POST http://localhost:3000/api/maps \
  -H "Content-Type: application/json" \
  -d '{"name": "测试地图", "description": "测试描述"}'

# 获取地图列表
curl http://localhost:3000/api/maps

# 加入地图
curl -X POST http://localhost:3000/api/maps/{mapId}/join \
  -H "X-Player-ID: test-001" \
  -H "X-Player-Name: 测试玩家"

# 创建存档
curl -X POST http://localhost:3000/api/maps/{mapId}/archives \
  -H "Content-Type: application/json" \
  -H "X-Player-ID: test-001" \
  -H "X-Player-Name: 测试玩家" \
  -d '{"name": "存档1", "data": {"level": 5}}'
```

---

## 验收标准

- [x] `npm run dev` 可正常启动
- [x] `npm run build` 构建成功
- [x] TypeScript 类型检查通过
- [x] 所有 API 端点可访问
- [x] 前端页面正常渲染
- [x] Docker Compose 配置完整

---

## GitHub 仓库

https://github.com/qq200774491/Server-archive

---

## 下一步

测试通过后，执行归档：

```
/openspec:archive add-server-archive-system
```
