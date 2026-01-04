# Pa.HotNews（热点聚合）

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

一个简单的“热点/热搜聚合”示例项目：后端基于 ASP.NET Core 提供聚合抓取接口，前端基于 React + Vite 展示与分享热点内容，并提供 Docker Compose 一键启动。

- 预览地址：<https://news.aneiang.com/>

> 仓库包含两个子项目：
> - `Pa.HotNews.Api`：ASP.NET Core Web API（聚合抓取服务）
> - `Pa.HotNews.Web`：React + Vite 前端站点

---

## 快速体验

### URL 参数玩法（可直接点击）

- 关键词搜索：<https://news.aneiang.com/?q=AI>
- 深色主题：<https://news.aneiang.com/?theme=dark>
- 仅显示指定来源（示例：知乎 + 微博 + B站）：<https://news.aneiang.com/?sources=zhihu,weibo,bilibili>
- 组合示例（关键词 + 主题 + 来源）：<https://news.aneiang.com/?q=AI&theme=dark&sources=zhihu,weibo>

---

## 网站特有功能

- **全局搜索（跨来源过滤）**：支持在顶部搜索框输入关键词，跨所有来源过滤标题；搜索时会自动隐藏“无匹配结果”的来源卡片。
- **主题切换**：支持 **深色 / 浅色 / 护眼暖色** 三套主题，使用 CSS 变量实现，并会持久化到 `localStorage`。
- **来源管理（订阅/隐藏/排序）**：可在“来源管理”中勾选显示/隐藏来源，并使用上下箭头调整卡片顺序；配置会持久化到 `localStorage`。
- **已读标记**：点击条目后会按 URL 记录已读状态，再次浏览时会有已读样式提示（本地持久化）。
- **收藏夹**：支持一键收藏/取消收藏条目，并在“收藏”抽屉中按标题搜索、按来源筛选、支持一键清空（本地持久化）。
- **一键分享 / 复制链接**：支持“分享本站”（优先 Web Share API，不支持时降级为复制链接）；并支持“复制当前筛选链接”（把搜索词/主题/来源白名单编码进 URL，便于分享同款视图）。
- **快照复制（Markdown）**：支持将单个来源榜单复制为 Markdown 快照（含排名与链接），便于粘贴到群聊/文档。
- **生成海报（图片导出）**：支持将单个来源榜单渲染为海报并导出 PNG（使用 `html-to-image`，并按主题设置背景色，避免透明背景问题）。
- **按 URL 参数快速定位视图**：支持通过 URL 参数预设视图：
  - `?q=关键词`：预填搜索词
  - `?theme=dark|light|warm`：指定主题
  - `?sources=zhihu,weibo,...`：仅显示指定来源
- **失败来源单独重试**：当某个来源加载失败时，卡片内提供“重试该来源”，不影响其他来源正常展示。

---

## 截图

| 预览 |
| --- |
| ![ScreenShot_2026-01-04_114410_940](./docments/ScreenShot_2026-01-04_114410_940.png) |
| ![ScreenShot_2026-01-04_120819_009](./docments/ScreenShot_2026-01-04_120819_009.png) |
| ![ScreenShot_2026-01-04_120855_967](./docments/ScreenShot_2026-01-04_120855_967.png) |
| ![ScreenShot_2026-01-04_120913_719](./docments/ScreenShot_2026-01-04_120913_719.png) |

---

## 功能特性

- 聚合抓取：通过 `Aneiang.Pa.*` 相关组件聚合多个来源的内容（新闻/热搜/彩票等，具体以接口返回为准）
- Swagger（开发环境）：本地开发时可直接通过 Swagger 调试接口
- CORS 支持：默认允许跨域访问（生产环境建议收敛到指定域名）
- 响应缓存：API 端启用 Response Caching，默认缓存 15 分钟
- Docker 化部署：提供 `docker-compose.yml`，一键启动前后端

---

## 技术栈

### 后端（`Pa.HotNews.Api`）

- .NET：`net8.0`
- Web 框架：ASP.NET Core
- OpenAPI：Swashbuckle（Swagger）
- 依赖：`Aneiang.Pa.AspNetCore`（以及其引入的抓取/聚合能力）

### 前端（`Pa.HotNews.Web`）

- React 19 + Vite
- UI：Ant Design（antd）
- 路由：react-router-dom
- 请求：axios
- 图片导出：html-to-image

---

## 目录结构

```text
.
├── Pa.HotNews.Api/            # 后端 API
├── Pa.HotNews.Web/            # 前端 Web
├── docker-compose.yml         # 一键启动（推荐）
└── Pa.HotNews.sln             # Visual Studio 解决方案
```

---

## 快速开始（推荐：Docker Compose）

确保已安装：Docker / Docker Compose。

在仓库根目录执行：

```bash
docker compose up -d --build
```

启动后：

- Web：`http://localhost:5173`
- API：`http://localhost:5000`

> compose 映射关系（见 `docker-compose.yml`）：
> - API 容器内部 `8080` → 宿主机 `5000`
> - Web 容器内部 `80` → 宿主机 `5173`

停止：

```bash
docker compose down
```

---

## 本地开发（不使用 Docker）

### 1）启动后端 API

前置：安装 .NET SDK（建议 8.x）。

```bash
cd Pa.HotNews.Api

dotnet restore

dotnet run
```

开发环境下会启用 Swagger（见 `Program.cs` 中 `if (app.Environment.IsDevelopment())`）：

- Swagger：一般为 `https://localhost:<port>/swagger` 或 `http://localhost:<port>/swagger`（以控制台输出为准）

### 2）启动前端 Web

前置：Node.js（建议 18+）。

```bash
cd Pa.HotNews.Web

npm install
npm run dev
```

浏览器访问：

- `http://localhost:5173`

---

## API 说明（概要）

本项目通过 `Aneiang.Pa.AspNetCore` 的 `ScraperController` 暴露接口，并在 `Program.cs` 中配置：

- 路由前缀：`/api/scraper`
- route 小写：启用
- 响应缓存：启用（默认 900 秒）

因此接口一般形如：

- `GET /api/scraper/...`

### API 调用示例（以实际 Swagger 为准）

由于本仓库中 `ScraperController` 来自外部依赖（`Aneiang.Pa.AspNetCore` NuGet 包），具体 endpoint 以 Swagger 显示为准。

你可以在本地启动 API 后，通过 Swagger 查看并复制 curl：

1. `cd Pa.HotNews.Api && dotnet run`
2. 打开：`http(s)://localhost:<port>/swagger`

也可以先尝试用以下方式探测（若 404 属正常现象，请以 Swagger 为准）：

```bash
# 探测路由前缀是否可达（示例）
curl -i http://localhost:5000/api/scraper
```

---

## 常见问题（FAQ）

### 1）某些来源显示“加载失败”怎么办？

- 可能原因：网络波动、第三方站点限流、站点结构变动导致抓取失败。
- 解决办法：
  - 点击该来源卡片内的“重试该来源”
  - 稍等一段时间再刷新（后端默认缓存 15 分钟，短时间内频繁刷新意义不大）
  - 若长期失败，欢迎提 Issue 并附上：来源名、时间点、控制台/后端日志

### 2）Docker 启动后端口被占用？

- 本项目默认占用：
  - Web：`5173`
  - API：`5000`
- 如果冲突，请修改 `docker-compose.yml` 中的端口映射，例如：

```yml
ports:
  - "15000:8080"
```

### 3）为什么 README 里没写死具体 API 路由？

API Controller 来自 `Aneiang.Pa.AspNetCore` 依赖包，仓库内未直接包含 controller 源码；不同版本可能存在路由差异，因此以 Swagger 为准最准确。

---

## 部署建议

- 简单部署：直接使用 `docker compose up -d --build`
- 生产部署：建议配置反向代理（Nginx/Traefik），并将 CORS 域名收敛
  - 当前后端 CORS 为 `AllowAnyOrigin()`，更适合开发环境；上线建议只允许你的站点域名

---

## 贡献

欢迎 Issue / PR：

- Bug：请提供复现步骤、日志、运行环境
- Feature：请说明使用场景与期望效果

---

## 许可证

本项目基于 **MIT License** 开源，详见 [LICENSE](./LICENSE)。

---

## 致谢

- `Aneiang.Pa.*` 相关组件
- React / Vite / Ant Design 等开源项目
