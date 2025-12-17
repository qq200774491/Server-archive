## ADDED Requirements

### Requirement: Next.js 前端应用

系统 SHALL 提供基于 Next.js App Router 的管理前端。

#### Scenario: 应用访问
- **WHEN** 用户访问根路径 `/`
- **THEN** 显示首页/仪表盘
- **AND** 包含导航到各功能模块的入口

#### Scenario: 响应式布局
- **WHEN** 在不同设备访问
- **THEN** 布局自适应屏幕尺寸
- **AND** 移动端可正常使用

---

### Requirement: 地图管理页面

系统 SHALL 提供地图管理界面。

#### Scenario: 地图列表
- **WHEN** 访问 `/maps`
- **THEN** 显示所有地图的列表
- **AND** 每个地图显示名称、描述、玩家数

#### Scenario: 地图详情
- **WHEN** 点击地图进入详情页
- **THEN** 显示地图完整信息
- **AND** 显示排行榜维度列表
- **AND** 提供编辑和删除操作

#### Scenario: 创建地图
- **WHEN** 点击创建地图按钮
- **THEN** 显示创建表单
- **AND** 表单验证通过后创建成功

---

### Requirement: 玩家管理页面

系统 SHALL 提供玩家查看界面。

#### Scenario: 玩家列表
- **WHEN** 访问 `/players`
- **THEN** 显示所有玩家的列表
- **AND** 支持搜索和分页

#### Scenario: 玩家详情
- **WHEN** 点击玩家进入详情页
- **THEN** 显示玩家信息
- **AND** 显示玩家参与的地图
- **AND** 显示各地图的存档数量

---

### Requirement: 存档管理页面

系统 SHALL 提供存档查看界面。

#### Scenario: 存档列表
- **WHEN** 在地图详情页查看存档
- **THEN** 显示该地图的所有存档
- **AND** 按玩家分组显示

#### Scenario: 存档详情
- **WHEN** 点击存档进入详情页
- **THEN** 显示存档元信息
- **AND** 显示存档数据（JSON 格式化）
- **AND** 显示关联的排行榜成绩

---

### Requirement: 排行榜页面

系统 SHALL 提供排行榜展示界面。

#### Scenario: 排行榜入口
- **WHEN** 访问 `/leaderboard` 或从地图进入
- **THEN** 显示地图选择
- **AND** 显示维度选择

#### Scenario: 排行榜展示
- **WHEN** 选择地图和维度
- **THEN** 显示排行榜数据表格
- **AND** 包含排名、玩家名、存档名、成绩、时间
- **AND** 支持分页

#### Scenario: 排行榜维度切换
- **WHEN** 切换排行榜维度
- **THEN** 刷新排行榜数据
- **AND** 显示对应维度的成绩

---

### Requirement: UI 组件库

系统 SHALL 使用 shadcn/ui 组件库和 Tailwind CSS。

#### Scenario: 组件一致性
- **WHEN** 渲染 UI 组件
- **THEN** 使用统一的设计语言
- **AND** 支持深色/浅色主题切换

#### Scenario: 表格组件
- **WHEN** 显示数据列表
- **THEN** 使用统一的表格组件
- **AND** 支持排序和分页

#### Scenario: 表单组件
- **WHEN** 显示输入表单
- **THEN** 使用统一的表单组件
- **AND** 包含验证和错误提示
