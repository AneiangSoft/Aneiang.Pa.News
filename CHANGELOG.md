# 变更日志（Changelog）

## [1.0.8] - 2026-01-19

### 功能/体验
- 顶部导航与操作区重构：
  - 桌面端增加“主导航 Menu + 搜索”的三段式布局，信息架构更清晰。
  - 桌面端操作收敛到“更多”菜单（包含打开方式、复制筛选链接、分享、来源管理、GitHub）。
  - 移动端菜单重构：支持“频道（view）切换”、主题切换、打开方式切换、收藏/来源管理/分享等入口。
- 首屏加载体验优化：热榜首屏由 `Spin` 替换为骨架屏（Skeleton），并适配网格布局。
- 主题与全局组件样式增强：
  - 三主题（dark/light/warm）文本变量细分（新增 `--text-tertiary` / `--text-disabled`），整体对比度更一致。
  - 增强 Ant Design 全局覆写（Input/Select/Dropdown/Drawer/Modal/Skeleton/Empty 等）在三主题下的可读性与一致性。
- 新增IT之家、36氪资讯数据

### 安全/配置
- 清理敏感配置：移除 `Pa.HotNews.Api/appsettings.json` 中的 `LlmRanking.ApiKey` 与 `Site.Title` 明文配置（避免泄露与环境耦合）。

### 构建/部署
- Docker 镜像发布：新增 `caco/aneiang-pa-news:1.0.8`，并同步更新 `latest` 指向本版本。
- Docker 镜像支持多架构：`linux/amd64`、`linux/arm64`。

## [1.0.7] - 2026-01-11

### 新增
- Docker 镜像发布：新增 `caco/aneiang-pa-news:1.0.7`，并同步更新 `latest` 指向本版本。

### 功能
- 前端热榜页支持 URL 参数：
  - `q`：全局搜索词
  - `theme`：主题（`light|dark|warm`）
  - `sources`：仅显示指定来源（逗号分隔）
  - `view`：视图切换（`hotnews|llm`，其中 `llm` 受 `/api/features` 开关控制）
- 站内阅读支持来源兼容策略：对部分不支持 iframe 的来源（如知乎/百度/抖音/头条等）降级为友好提示 + 新开原文。
- 增强分享能力：筛选链接、Markdown 快照复制、热榜海报生成与下载。

### 构建/部署
- 构建链路：继续使用 .NET 8 + Node 20；前端使用 Vite 7.x 构建。

### 文档
- README：完善前端项目（`Pa.HotNews.Web`）的功能说明、联调方式（Vite 代理 `/api`）与部署示例。

## [1.0.5] - 2026-01-07
- 首个对外发布版本（对 1.0.0 之后的所有改动统一归档到本版本）。
- 首页热榜加载体验优化：改为“分来源独立加载”，单个平台响应慢不再阻塞整页首屏加载。
- 前端请求超时调整：Axios 超时改为 60 秒，避免请求无限挂起导致卡片长期处于加载状态。
- 部署文档完善：README 补充 `docker-compose.yml`（Redis 缓存/站点信息/LLM 配置）相关说明与示例。

## [1.0.0] - 2026-01-04
- 初始开发里程碑（内部版本）。
- 前端：搜索、主题切换（深色/浅色/护眼）、来源管理（排序/隐藏）、已读标记、收藏夹、分享、复制筛选链接、Markdown 快照、榜单海报导出。
- 后端：聚合抓取接口、开发环境 Swagger、CORS、响应缓存（默认 15 分钟）。
- Docker Compose：一键启动前后端。
- 开源基础：MIT License、根目录 README、截图展示、URL 参数示例链接、FAQ、变更日志。
