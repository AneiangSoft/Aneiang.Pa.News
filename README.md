<p align="right">
  <strong>中文</strong> | <a href="README_EN.md">English</a>
</p>

<p align="center">
  <img src="docments/logo-light.svg" alt="Aneiang.Pa" width="150" style="vertical-align:middle;border-radius:8px;" />
  <h1 align="center">Aneiang.Pa.News - 全网热点聚合平台</h1>
  <p align="center">
    <a href="https://github.com/AneiangSoft/Aneiang.Pa.News/stargazers">
      <img src="https://img.shields.io/github/stars/AneiangSoft/Aneiang.Pa.News?style=social" alt="GitHub stars">
    </a>
    <a href="https://github.com/AneiangSoft/Aneiang.Pa.News/network/members">
      <img src="https://img.shields.io/github/forks/AneiangSoft/Aneiang.Pa.News?style=social" alt="GitHub forks">
    </a>
    <a href="https://github.com/AneiangSoft/Aneiang.Pa.News/issues">
      <img src="https://img.shields.io/github/issues/AneiangSoft/Aneiang.Pa.News" alt="GitHub issues">
    </a>
    <a href="https://github.com/AneiangSoft/Aneiang.Pa.News/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/AneiangSoft/Aneiang.Pa.News" alt="License">
    </a>
    <a href="https://hub.docker.com/r/caco/aneiang-pa-news">
      <img src="https://img.shields.io/docker/pulls/caco/aneiang-pa-news" alt="Docker Pulls">
    </a>
  </p>
</p>


## 🌟 项目介绍

Aneiang.Pa.News 是一个现代化的热点/热搜聚合平台，旨在为用户提供一站式的热点资讯浏览体验。通过智能抓取多个主流平台的热点内容，结合优雅的界面设计，让用户能够快速了解全网热点。

### ✨ 主要特性

- **多平台聚合**：整合微博、知乎、百度、今日头条等多个平台的热搜榜单。
- **个性化来源管理**：支持拖拽排序、隐藏/显示新闻来源，定制自己的信息流。
- **多种阅读模式**：支持“站内阅读”（抽屉弹层）和“新标签页打开”，满足不同阅读习惯。
- **丰富的主题**：内置浅色、深色、护眼三种主题，并支持自定义主题色。
- **收藏夹**：一键收藏感兴趣的热点，方便稍后阅读和回顾。
- **强大的分享功能**：
  - **海报分享**：一键生成精美的热榜海报，适合社交媒体传播。
  - **快照复制**：以 Markdown 格式复制榜单内容，便于在文本环境分享。
  - **筛选链接**：将当前的搜索、来源过滤条件生成一个可分享的链接。
- **大模型排行榜**：集成并展示大语言模型性能排行榜（由后端 `/api/features` 控制是否启用）。
- **Docker 一键部署**：提供开箱即用的 Docker 镜像和 Compose 配置，支持快速、跨平台部署。

### 🚀 在线体验

- **在线预览**：[https://news.aneiang.com/](https://news.aneiang.com/)
- **Docker 镜像**：`caco/aneiang-pa-news`（建议使用固定版本 tag，例如 `:1.0.7`）

> PS: 项目基于 **Aneiang.Pa** 爬虫库实现，有兴趣的小伙伴可以点击了解：
> - **Github**: [https://github.com/AneiangSoft/Aneiang.Pa](https://github.com/AneiangSoft/Aneiang.Pa)
> - **Gitee**: [https://gitee.com/AneiangSoft/Aneiang.Pa](https://gitee.com/AneiangSoft/Aneiang.Pa)

## 🏗️ 系统架构

```mermaid
graph TD
    A[用户浏览器] -->|请求| B[Vite + React 前端（Pa.HotNews.Web）]
    B -->|API 调用| C[ASP.NET Core Web API（Pa.HotNews.Api）]
    C -->|抓取数据| D[第三方平台]
    C -->|缓存| E[内存缓存 / Redis]
    C -->|站点配置 / 功能开关| G1[/api/site-config & /api/features]
    C -->|日志| F[日志系统（Serilog）]

    subgraph 部署（Docker）
    G[Docker 容器] --> H[前端静态文件（Vite build 产物）]
    G --> I[.NET 运行时]
    end
```

## 🛠️ 技术栈

### 前端 (`Pa.HotNews.Web`)
- **框架**：React 19 (JavaScript, JSX)
- **构建工具**：Vite 7.x
- **UI 组件库**：Ant Design 6.x
- **路由**：React Router v7
- **HTTP 客户端**：Axios
- **代码规范**：ESLint

### 后端 (`Pa.HotNews.Api`)
- **运行时**：.NET 8
- **Web 框架**：ASP.NET Core 8
- **HTTP 客户端**：HttpClientFactory
- **依赖注入**：内置 DI 容器
- **日志系统**：Serilog
- **配置管理**：JSON + 环境变量

## 🚀 快速开始

### 方式 A：使用 Docker 部署（推荐）

确保已安装 Docker 和 Docker Compose。

#### 1. 使用 `docker run`

```bash
# 拉取最新镜像
docker pull caco/aneiang-pa-news:1.0.7

# 准备日志目录
mkdir -p logs

# 运行容器
docker run -d --name aneiang-pa-news \
  -p 5000:8080 \
  -e ASPNETCORE_URLS=http://+:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e Scraper__CacheProvider=Memory \
  caco/aneiang-pa-news:1.0.7
```

#### 2. 使用 `docker-compose`

仓库内提供了 `docker-compose.yml` 示例，推荐使用 Redis 作为缓存后端以获得更佳性能和多实例支持。

**增强版（Redis 缓存，推荐）**：

> ⚠️ 注意：请把下面的 Redis 地址、密码等改成你自己的；建议不要把真实密码提交到公开仓库。

```yaml
services:
  hotnews:
    image: caco/aneiang-pa-news:1.0.7
    container_name: aneiang-pa-news
    ports:
      - "5000:8080"
    environment:
      ASPNETCORE_URLS: "http://+:8080"
      ASPNETCORE_ENVIRONMENT: "Production"

      # 爬虫缓存（Redis）
      Scraper__CacheProvider: "Redis"
      Scraper__CacheDuration: "00:30:00"
      Scraper__Redis__Configuration: "<redis-host>:6379,password=<redis-password>,defaultDatabase=3"
      Scraper__Redis__InstanceName: "Aneiang.Pa:"

      # 站点信息（页眉/页脚）
      Site__Title: "Aneiang 热榜聚合"
      Site__TitleSuffix: " - 全网热点实时聚合"
      Site__IcpLicense: "湘ICP备2023022000号-2"

      # 大模型排行榜（可选）
      # LlmRanking__ApiKey: "<your-api-key>"

    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

然后启动服务：

```bash
# 准备日志目录
mkdir -p logs

# 启动服务
docker compose up -d

# 更新服务（拉取新镜像并重启）
# docker compose pull && docker compose up -d
```

启动后：

- **Web 首页**：`http://localhost:5000/`
- **API 文档**：`http://localhost:5000/swagger`（仅当 `ASPNETCORE_ENVIRONMENT` 设置为 `Development` 时可用）

### 方式 B：从源码构建（用于开发）

#### 先决条件

- .NET 8.0 SDK 或更高版本
- Node.js 18+ 和 npm 9+
- Git

#### 1. 克隆仓库

```bash
git clone https://github.com/AneiangSoft/Aneiang.Pa.News.git
cd Aneiang.Pa.News
```

#### 2. 启动后端服务

```bash
cd Pa.HotNews.Api
dotnet restore
dotnet run
```
后端服务将运行在 `http://localhost:8080`。

#### 3. 启动前端开发服务器

打开一个新的终端窗口：

```bash
cd Pa.HotNews.Web
npm install
npm run dev
```
前端开发服务器将运行在 `http://localhost:5173`。它已通过 `vite.config.js` 配置了代理，所有 `/api` 请求都会被转发到 `http://localhost:8080`，实现前后端联调。

## 📦 项目结构

```
Aneiang.Pa.News/
├── docments/           # 文档和截图
├── Pa.HotNews.Api/     # .NET Web API 后端项目
│   ├── Controllers/    # API 控制器
│   ├── Services/       # 业务逻辑
│   └── Program.cs      # 应用入口
├── Pa.HotNews.Web/     # React 前端项目
│   ├── public/         # 静态资源
│   ├── src/
│   │   ├── components/ # React 组件
│   │   ├── hooks/      # 自定义 Hooks
│   │   ├── services/   # API 请求服务
│   │   ├── utils/      # 工具函数
│   │   ├── App.jsx     # 应用根组件
│   │   └── main.jsx    # 应用入口
│   ├── vite.config.js  # Vite 配置文件（含代理）
│   └── package.json
└── docker-compose.yml  # Docker Compose 配置文件
```

## 🔧 配置说明

### 后端环境变量 (Docker)

| 环境变量 | 说明 | 示例/默认 |
|---------|------|----------|
| `ASPNETCORE_ENVIRONMENT` | 环境名称 | `Production` |
| `ASPNETCORE_URLS` | 服务监听地址 | `http://+:8080` |
| `Site__Title` | 站点标题 | `Aneiang 热榜聚合` |
| `Site__TitleSuffix` | 标题后缀 | ` - 全网热点实时聚合` |
| `Site__IcpLicense` | ICP 备案号（页脚展示） | `湘ICP备2023022000号-2` |
| `LlmRanking__ApiKey` | 大模型排行榜 API Key | 空 |
| `Scraper__CacheProvider` | 爬虫缓存提供者 | `Redis` / `Memory` |
| `Scraper__CacheDuration` | 爬虫缓存时长 | `00:30:00` |
| `Scraper__Redis__Configuration` | Redis 连接串 | `host:6379,password=***,defaultDatabase=3` |
| `Scraper__Redis__InstanceName` | Redis Key 前缀 | `Aneiang.Pa:` |

### 前端环境变量 (`.env`)

在 `Pa.HotNews.Web` 目录下创建 `.env` 文件可覆盖默认配置。

| 环境变量 | 说明 | 默认值 |
|---|---|---|
| `VITE_API_BASE_URL` | API 基础路径（通常无需修改） | `/api` |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request。在提交代码前，请确保：

1. Fork 项目到你的 GitHub 账户
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 开源协议

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

- [.NET](https://dotnet.microsoft.com/) - 强大的跨平台开发框架
- [Aneiang.Pa](https://pa.aneiang.com/) - 功能丰富的 .NET 模块化爬虫库
- [React](https://reactjs.org/) - 用于构建用户界面的 JavaScript 库
- [Ant Design](https://ant.design/) - 企业级 UI 设计语言
- [Vite](https://vitejs.dev/) - 下一代前端工具链
- [ArtificialAnalysis](https://artificialanalysis.ai/) - 大模型排行榜数据源

## 📞 联系我们

- 邮箱：aneiang@qq.com
- GitHub Issues: [https://github.com/AneiangSoft/Aneiang.Pa.News/issues](https://github.com/AneiangSoft/Aneiang.Pa.News/issues)
