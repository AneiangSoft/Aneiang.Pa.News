<p align="right">
  <a href="README.md">中文</a> | <strong>English</strong>
</p>

<p align="center">
  <img src="docments/logo-light.svg" alt="Aneiang.Pa" width="150" style="vertical-align:middle;border-radius:8px;" />
  <h1 align="center">Aneiang.Pa.News - Hot News Aggregation Platform</h1>
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

<p align="right">
  <a href="README.md">中文</a> | <strong>English</strong>
</p>

## 🌟 Project Overview

Aneiang.Pa.News is a modern hot news / trending topics aggregation platform. It crawls hot lists from multiple mainstream sources and presents them in a clean and user-friendly interface, helping you quickly stay on top of what’s trending on the internet.

### ✨ Key Features

- **Multi-source aggregation**: Aggregate hot lists from Weibo, Zhihu, Baidu, Toutiao and more.
- **Personalized source management**: Drag to reorder sources; show/hide sources to build your own feed.
- **Multiple reading modes**: In-app reading (drawer) and open in new tab.
- **Themes**: Built-in Light / Dark / Eye-care themes.
- **Favorites**: Save items for later.
- **Sharing**:
  - Generate a poster image for a source hot list
  - Copy a Markdown snapshot
  - Generate a sharable filtered URL (search / sources / theme)
- **LLM leaderboard**: A built-in LLM ranking view (controlled by backend feature flags `/api/features`).
- **Docker deployment**: Ready-to-use Docker image & Compose config.

### 🚀 Live Demo

- **Live Preview**: https://news.aneiang.com/
- **Docker Image**: `caco/aneiang-pa-news` (recommended to pin to a version tag such as `:1.0.7`)

> Note: This project is based on the **Aneiang.Pa** crawler library:
> - GitHub: https://github.com/AneiangSoft/Aneiang.Pa
> - Gitee: https://gitee.com/AneiangSoft/Aneiang.Pa

## 🏗️ System Architecture

```mermaid
graph TD
    A[Browser] -->|Request| B[Vite + React Frontend (Pa.HotNews.Web)]
    B -->|API Calls| C[ASP.NET Core Web API (Pa.HotNews.Api)]
    C -->|Scrape Data| D[Third-party Platforms]
    C -->|Cache| E[In-Memory / Redis]
    C -->|Site Config / Feature Flags| G1[/api/site-config & /api/features]
    C -->|Logging| F[Logging (Serilog)]

    subgraph Deployment (Docker)
    G[Docker Container] --> H[Frontend static files (Vite build output)]
    G --> I[.NET Runtime]
    end
```

## 🛠️ Tech Stack

### Frontend (`Pa.HotNews.Web`)
- **Framework**: React 19 (JavaScript, JSX)
- **Build Tool**: Vite 7.x
- **UI Library**: Ant Design 6.x
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Linting**: ESLint

### Backend (`Pa.HotNews.Api`)
- **Runtime**: .NET 8
- **Web Framework**: ASP.NET Core 8
- **HTTP Client**: HttpClientFactory
- **Dependency Injection**: built-in DI container
- **Logging**: Serilog
- **Configuration**: JSON + environment variables

## 🚀 Quick Start

### Option A: Docker (Recommended)

```bash
# pull image
docker pull caco/aneiang-pa-news:1.0.7

# run
docker run -d --name aneiang-pa-news \
  -p 5000:8080 \
  -e ASPNETCORE_URLS=http://+:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e Scraper__CacheProvider=Memory \
  caco/aneiang-pa-news:1.0.7
```

### Option B: Build from source (Development)

#### Prerequisites

- .NET 8 SDK+
- Node.js 18+ (npm 9+)

#### Backend

```bash
cd Pa.HotNews.Api
dotnet restore
dotnet run
```

Backend runs on `http://localhost:8080`.

#### Frontend

```bash
cd Pa.HotNews.Web
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Vite is configured to proxy `/api` requests to `http://localhost:8080` (see `Pa.HotNews.Web/vite.config.js`).

## 📦 Project Structure

```text
Aneiang.Pa.News/
├── docments/
├── Pa.HotNews.Api/
└── Pa.HotNews.Web/
```

## 🔧 Configuration

### Backend environment variables (Docker)

| Variable | Description | Example/Default |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | Environment | `Production` |
| `ASPNETCORE_URLS` | Listen URLs | `http://+:8080` |
| `Site__Title` | Site title | `Aneiang Hot News` |
| `Site__TitleSuffix` | Title suffix | ` - Real-time Hot Topics` |
| `Site__IcpLicense` | Footer license text | empty |
| `LlmRanking__ApiKey` | LLM ranking API key | empty |
| `Scraper__CacheProvider` | Cache provider | `Redis` / `Memory` |
| `Scraper__CacheDuration` | Cache duration | `00:30:00` |
| `Scraper__Redis__Configuration` | Redis connection string | `host:6379,password=***,defaultDatabase=3` |
| `Scraper__Redis__InstanceName` | Redis key prefix | `Aneiang.Pa:` |

### Frontend environment variables (`.env`)

Create `.env` inside `Pa.HotNews.Web/`.

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | API base (usually no need to change) | `/api` |

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m "Add some AmazingFeature"`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

MIT License. See [LICENSE](LICENSE).

## 📞 Contact

- Email: aneiang@qq.com
- Issues: https://github.com/AneiangSoft/Aneiang.Pa.News/issues
