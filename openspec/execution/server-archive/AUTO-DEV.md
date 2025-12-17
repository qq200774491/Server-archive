# ServerArchive 并发开发任务

## 并行波次图

```
Wave 1:  [INIT-01 项目初始化]
              ↓
Wave 2:  [DB-01 数据库层] ←→ [UI-01 UI组件库]  (可并行)
              ↓
Wave 3:  [API-01 地图API] ←→ [API-02 玩家API] ←→ [API-03 存档API] ←→ [API-04 排行榜API]  (可并行)
              ↓
Wave 4:  [FE-01 地图页面] ←→ [FE-02 玩家页面] ←→ [FE-03 存档页面] ←→ [FE-04 排行榜页面]  (可并行)
              ↓
Wave 5:  [DEPLOY-01 Docker部署]
```

---

## 任务详情

### Task: INIT-01 项目初始化

**预估上下文**：~15k tokens
**状态**：🟦 空闲
**依赖**：无

**必读**：
- `openspec/changes/add-server-archive-system/design.md` - 技术设计
- `openspec/changes/add-server-archive-system/proposal.md` - 项目概述

**范围**：
- [ ] 初始化 Next.js 14+ 项目 (App Router + TypeScript)
- [ ] 配置 Tailwind CSS
- [ ] 安装 Prisma 并配置
- [ ] 创建 `.env.example` 文件
- [ ] 配置 ESLint 和 TypeScript

**验收标准**：
- [ ] `npm run dev` 可正常启动
- [ ] TypeScript 编译无错误
- [ ] Tailwind 样式生效

---

### Task: DB-01 数据库层实现

**预估上下文**：~20k tokens
**状态**：🟦 空闲
**依赖**：INIT-01

**必读**：
- `openspec/changes/add-server-archive-system/design.md` - Prisma Schema 设计
- `openspec/changes/add-server-archive-system/specs/database/spec.md` - 数据库规格

**范围**：
- [ ] 编写完整的 Prisma schema (Player, Map, MapPlayer, Archive, LeaderboardDimension, LeaderboardEntry)
- [ ] 创建 `lib/db.ts` Prisma client 封装
- [ ] 生成并执行数据库迁移
- [ ] 创建种子数据脚本 `prisma/seed.ts`

**验收标准**：
- [ ] `npx prisma migrate dev` 成功
- [ ] `npx prisma db seed` 可执行
- [ ] 所有模型关联正确

---

### Task: UI-01 UI组件库配置

**预估上下文**：~15k tokens
**状态**：🟦 空闲
**依赖**：INIT-01

**必读**：
- `openspec/changes/add-server-archive-system/specs/frontend/spec.md` - 前端规格

**范围**：
- [ ] 安装配置 shadcn/ui
- [ ] 添加基础组件 (Button, Card, Table, Input, Form, Dialog, Badge, Skeleton)
- [ ] 创建主布局组件 `app/layout.tsx`
- [ ] 创建导航组件 `components/nav.tsx`
- [ ] 创建分页组件 `components/pagination.tsx`

**验收标准**：
- [ ] shadcn/ui 组件可正常使用
- [ ] 主布局包含导航栏
- [ ] 响应式布局正常

---

### Task: API-01 地图模块 API

**预估上下文**：~18k tokens
**状态**：🟦 空闲
**依赖**：DB-01

**必读**：
- `openspec/changes/add-server-archive-system/specs/api/spec.md` - API 规格（地图部分）
- `openspec/changes/add-server-archive-system/design.md` - API 设计

**范围**：
- [ ] 实现 `GET /api/maps` - 获取所有地图
- [ ] 实现 `GET /api/maps/[mapId]` - 获取地图详情
- [ ] 实现 `POST /api/maps` - 创建地图
- [ ] 实现 `PUT /api/maps/[mapId]` - 更新地图
- [ ] 实现 `DELETE /api/maps/[mapId]` - 删除地图

**验收标准**：
- [ ] 所有端点返回正确 JSON 格式
- [ ] 错误处理完善
- [ ] TypeScript 类型完整

---

### Task: API-02 玩家模块 API

**预估上下文**：~18k tokens
**状态**：🟦 空闲
**依赖**：DB-01

**必读**：
- `openspec/changes/add-server-archive-system/specs/api/spec.md` - API 规格（玩家部分）
- `openspec/changes/add-server-archive-system/design.md` - 认证设计

**范围**：
- [ ] 实现认证中间件 `lib/auth.ts` (解析 X-Player-ID, X-Player-Name)
- [ ] 实现 `GET /api/players/me` - 获取当前玩家
- [ ] 实现 `GET /api/maps/[mapId]/players` - 地图玩家列表
- [ ] 实现 `POST /api/maps/[mapId]/join` - 加入地图

**验收标准**：
- [ ] 认证中间件正确识别玩家
- [ ] 自动注册新玩家
- [ ] 缺少身份头返回 401

---

### Task: API-03 存档模块 API

**预估上下文**：~18k tokens
**状态**：🟦 空闲
**依赖**：DB-01, API-02

**必读**：
- `openspec/changes/add-server-archive-system/specs/api/spec.md` - API 规格（存档部分）

**范围**：
- [ ] 实现 `GET /api/maps/[mapId]/archives` - 获取我的存档列表
- [ ] 实现 `GET /api/archives/[archiveId]` - 获取存档详情
- [ ] 实现 `POST /api/maps/[mapId]/archives` - 创建存档
- [ ] 实现 `PUT /api/archives/[archiveId]` - 更新存档
- [ ] 实现 `DELETE /api/archives/[archiveId]` - 删除存档

**验收标准**：
- [ ] 存档与玩家正确关联
- [ ] JSON 数据正确存储
- [ ] 删除级联正确

---

### Task: API-04 排行榜模块 API

**预估上下文**：~20k tokens
**状态**：🟦 空闲
**依赖**：DB-01, API-03

**必读**：
- `openspec/changes/add-server-archive-system/specs/api/spec.md` - API 规格（排行榜部分）
- `openspec/changes/add-server-archive-system/specs/leaderboard/spec.md` - 排行榜规格

**范围**：
- [ ] 实现 `GET /api/maps/[mapId]/dimensions` - 获取排行榜维度
- [ ] 实现 `POST /api/maps/[mapId]/dimensions` - 创建排行榜维度
- [ ] 实现 `GET /api/maps/[mapId]/leaderboard/[dimensionId]` - 获取排行榜
- [ ] 实现 `POST /api/archives/[archiveId]/scores` - 提交成绩

**验收标准**：
- [ ] 排行榜排序正确 (ASC/DESC)
- [ ] 分页功能正常
- [ ] 成绩更新逻辑正确

---

### Task: FE-01 地图管理页面

**预估上下文**：~20k tokens
**状态**：🟦 空闲
**依赖**：UI-01, API-01

**必读**：
- `openspec/changes/add-server-archive-system/specs/frontend/spec.md` - 前端规格（地图部分）

**范围**：
- [ ] 实现地图列表页 `app/(dashboard)/maps/page.tsx`
- [ ] 实现地图详情页 `app/(dashboard)/maps/[mapId]/page.tsx`
- [ ] 实现创建地图表单
- [ ] 实现编辑地图表单
- [ ] 实现删除确认对话框

**验收标准**：
- [ ] 列表正确显示
- [ ] CRUD 操作正常
- [ ] 表单验证完善

---

### Task: FE-02 玩家管理页面

**预估上下文**：~15k tokens
**状态**：🟦 空闲
**依赖**：UI-01, API-02

**必读**：
- `openspec/changes/add-server-archive-system/specs/frontend/spec.md` - 前端规格（玩家部分）

**范围**：
- [ ] 实现玩家列表页 `app/(dashboard)/players/page.tsx`
- [ ] 实现玩家详情页 `app/(dashboard)/players/[playerId]/page.tsx`
- [ ] 显示玩家参与的地图
- [ ] 显示各地图存档数量

**验收标准**：
- [ ] 列表支持搜索
- [ ] 分页正常
- [ ] 详情数据完整

---

### Task: FE-03 存档管理页面

**预估上下文**：~15k tokens
**状态**：🟦 空闲
**依赖**：UI-01, API-03

**必读**：
- `openspec/changes/add-server-archive-system/specs/frontend/spec.md` - 前端规格（存档部分）

**范围**：
- [ ] 实现存档列表视图 (集成在地图详情页)
- [ ] 实现存档详情页 `app/(dashboard)/archives/[archiveId]/page.tsx`
- [ ] JSON 数据格式化展示
- [ ] 显示关联排行榜成绩

**验收标准**：
- [ ] 存档数据正确显示
- [ ] JSON 格式化可读
- [ ] 成绩关联正确

---

### Task: FE-04 排行榜页面

**预估上下文**：~18k tokens
**状态**：🟦 空闲
**依赖**：UI-01, API-04

**必读**：
- `openspec/changes/add-server-archive-system/specs/frontend/spec.md` - 前端规格（排行榜部分）
- `openspec/changes/add-server-archive-system/specs/leaderboard/spec.md` - 排行榜规格

**范围**：
- [ ] 实现排行榜页面 `app/(dashboard)/leaderboard/page.tsx`
- [ ] 实现地图选择器
- [ ] 实现维度选择器
- [ ] 实现排行榜表格（排名、玩家、存档、成绩、时间）
- [ ] 实现分页

**验收标准**：
- [ ] 维度切换正常
- [ ] 排序正确
- [ ] 分页正常

---

### Task: DEPLOY-01 Docker 一键部署

**预估上下文**：~15k tokens
**状态**：🟦 空闲
**依赖**：API-01, API-02, API-03, API-04, FE-01, FE-02, FE-03, FE-04

**必读**：
- `openspec/changes/add-server-archive-system/design.md` - Docker 配置设计

**范围**：
- [ ] 编写 `Dockerfile` (多阶段构建)
- [ ] 编写 `docker-compose.yml` (app + PostgreSQL)
- [ ] 编写启动脚本 `docker/start.sh` (含迁移)
- [ ] 编写 `.dockerignore`
- [ ] 编写 `README.md` 部署说明

**验收标准**：
- [ ] `docker-compose up -d` 一键启动
- [ ] 数据库迁移自动执行
- [ ] 应用可正常访问
- [ ] 数据持久化正确

---

## 执行说明

1. **启动调度器**：`cd tools/auto-dev-scheduler-web && npm run dev`
2. **分配任务**：调度器会根据依赖关系自动分配任务
3. **监控进度**：查看各任务状态更新
4. **完成后**：运行 `/openspec:archive add-server-archive-system` 归档
