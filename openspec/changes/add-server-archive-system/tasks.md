# Implementation Tasks

## 1. 项目初始化

- [ ] 1.1 初始化 Next.js 项目 (App Router + TypeScript)
- [ ] 1.2 配置 Tailwind CSS
- [ ] 1.3 安装 shadcn/ui 组件库
- [ ] 1.4 安装配置 Prisma
- [ ] 1.5 创建 .env.example 环境变量模板

## 2. 数据库层

- [ ] 2.1 编写 Prisma schema (Player, Map, MapPlayer, Archive, LeaderboardDimension, LeaderboardEntry)
- [ ] 2.2 创建数据库迁移
- [ ] 2.3 编写 Prisma client 封装 (lib/db.ts)
- [ ] 2.4 添加数据库种子脚本 (可选示例数据)

## 3. 认证中间件

- [ ] 3.1 实现玩家身份解析中间件 (X-Player-ID, X-Player-Name)
- [ ] 3.2 实现自动注册逻辑
- [ ] 3.3 创建认证工具函数

## 4. API - 地图模块

- [ ] 4.1 GET /api/maps - 获取所有地图
- [ ] 4.2 GET /api/maps/:mapId - 获取地图详情
- [ ] 4.3 POST /api/maps - 创建地图
- [ ] 4.4 PUT /api/maps/:mapId - 更新地图
- [ ] 4.5 DELETE /api/maps/:mapId - 删除地图

## 5. API - 玩家模块

- [ ] 5.1 GET /api/players/me - 获取当前玩家
- [ ] 5.2 GET /api/maps/:mapId/players - 地图玩家列表
- [ ] 5.3 POST /api/maps/:mapId/join - 加入地图

## 6. API - 存档模块

- [ ] 6.1 GET /api/maps/:mapId/archives - 获取我的存档列表
- [ ] 6.2 GET /api/archives/:archiveId - 获取存档详情
- [ ] 6.3 POST /api/maps/:mapId/archives - 创建存档
- [ ] 6.4 PUT /api/archives/:archiveId - 更新存档
- [ ] 6.5 DELETE /api/archives/:archiveId - 删除存档

## 7. API - 排行榜模块

- [ ] 7.1 GET /api/maps/:mapId/dimensions - 获取排行榜维度
- [ ] 7.2 POST /api/maps/:mapId/dimensions - 创建排行榜维度
- [ ] 7.3 GET /api/maps/:mapId/leaderboard/:dimensionId - 获取排行榜
- [ ] 7.4 POST /api/archives/:archiveId/scores - 提交成绩

## 8. 前端 - 布局与公共组件

- [ ] 8.1 创建主布局 (导航、侧边栏)
- [ ] 8.2 创建数据表格组件
- [ ] 8.3 创建分页组件
- [ ] 8.4 创建加载状态组件

## 9. 前端 - 地图管理页面

- [ ] 9.1 地图列表页
- [ ] 9.2 地图详情/编辑页
- [ ] 9.3 创建地图表单

## 10. 前端 - 玩家管理页面

- [ ] 10.1 玩家列表页
- [ ] 10.2 玩家详情页 (含存档列表)

## 11. 前端 - 存档管理页面

- [ ] 11.1 存档列表页
- [ ] 11.2 存档详情页

## 12. 前端 - 排行榜页面

- [ ] 12.1 排行榜维度选择
- [ ] 12.2 排行榜展示 (表格/卡片)
- [ ] 12.3 排行榜筛选与分页

## 13. Docker 部署

- [ ] 13.1 编写 Dockerfile (多阶段构建)
- [ ] 13.2 编写 docker-compose.yml
- [ ] 13.3 编写启动脚本 (含数据库迁移)
- [ ] 13.4 编写 README 部署说明

## Validation

- [ ] 所有 API 端点功能测试通过
- [ ] 前端页面正常渲染
- [ ] Docker Compose 一键部署成功
- [ ] 数据库迁移正常执行
- [ ] TypeScript 类型检查通过
- [ ] 构建成功
