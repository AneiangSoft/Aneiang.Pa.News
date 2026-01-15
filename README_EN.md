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

## 🌟 Project Overview

Aneiang.Pa.News is a modern hot news / trending topics aggregation platform. It provides a complete solution of "multi-source hot lists + comfortable reading experience + one-click deployment". The backend crawls and caches trending data from multiple platforms, while the frontend offers a customizable feed and sharing capabilities.

- **Live Preview**: https://news.aneiang.com/
- **Docker Image**: `caco/aneiang-pa-news` (recommended to pin to a version tag such as `:1.0.7`)

## 📖 Table of Contents

- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [FAQ](#-faq)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)
- [Contact](#-contact)

## ✨ Key Features

- **Multi-source aggregation**: Aggregate hot lists from Weibo, Zhihu, Baidu, Toutiao and more.
- **Source management**: Drag to reorder sources; show/hide sources to build your own feed.
- **Reading modes**: In-app reading (drawer) and open in new tab.
- **Themes**: Light / Dark / Eye-care themes + custom theme color.
- **Favorites**: Save items for later.
- **Sharing**: Poster generation, Markdown snapshot copy, sharable filtered URL.
- **LLM leaderboard**: Optional feature (controlled by the backend feature toggle).
- **Deployment-friendly**: Docker image and Compose config out of the box.

## 📸 Screenshots

- ![](docments/Aneiang.png)
- ![](docments/ScreenShot_2026-01-04_114410_940.png)
- ![](docments/ScreenShot_2026-01-04_120819_009.png)
- ![](docments/ScreenShot_2026-01-04_120855_967.png)
- ![](docments/ScreenShot_2026-01-04_120913_719.png)
- ![](docments/ScreenShot_2026-01-06_152216_843.png)
- ![](docments/ScreenShot_2026-01-06_152257_133.png)
- ![](docments/ScreenShot_2026-01-06_152321_913.png)
- ![](docments/ScreenShot_2026-01-15_105659_882.png)

> Note: This project is based on the **Aneiang.Pa** crawler library:
> - GitHub: https://github.com/AneiangSoft/Aneiang.Pa
> - Gitee: https://gitee.com/AneiangSoft/Aneiang.Pa

## Tech Stack

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

#### 1. `docker run`

```bash
# pull image
docker pull caco/aneiang-pa-news:1.0.7

# prepare logs directory
mkdir -p logs

# run
docker run -d --name aneiang-pa-news \
  -p 5000:8080 \
  -e ASPNETCORE_URLS=http://+:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e Scraper__CacheProvider=Memory \
  caco/aneiang-pa-news:1.0.7
```

#### 2. `docker-compose`

The repository includes a `docker-compose.yml` example. Two variants are provided below.

**Minimal (Memory cache, copy & run)**:

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

      # crawler cache (Memory)
      Scraper__CacheProvider: "Memory"
      Scraper__CacheDuration: "00:30:00"

    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

**Enhanced (Redis cache, recommended)**:

> Note: Replace Redis host/password with your own. Avoid committing real passwords to a public repo.

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

      # crawler cache (Redis)
      Scraper__CacheProvider: "Redis"
      Scraper__CacheDuration: "00:30:00"
      Scraper__Redis__Configuration: "<redis-host>:6379,password=<redis-password>,defaultDatabase=3"
      Scraper__Redis__InstanceName: "Aneiang.Pa:"

      # site info (header/footer)
      Site__Title: "Aneiang Hot News"
      Site__TitleSuffix: " - Real-time Hot Topics"
      Site__IcpLicense: "湘ICP备2023022000号-2"

      # LLM leaderboard (optional)
      # LlmRanking__ApiKey: "<your-api-key>"

    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

Then start the service:

```bash
mkdir -p logs

docker compose up -d

# update (pull new image and restart)
# docker compose pull && docker compose up -d
```

After startup:

- **Web**: `http://localhost:5000/`
- **Swagger**: `http://localhost:5000/swagger` (only available when `ASPNETCORE_ENVIRONMENT=Development`)

### Option B: Build from source (Development)

#### Prerequisites

- .NET 8 SDK+
- Node.js 18+ (npm 9+)
- Git

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

Vite is configured to proxy `/api` requests to the backend (usually `http://localhost:8080`). See `Pa.HotNews.Web/vite.config.js`.

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

## ❓ FAQ

### 1) I cannot access the web page

- Check if the container is running: `docker ps`
- Verify port mapping: the default example uses `-p 5000:8080`, so visit `http://localhost:5000/`
- If you changed ports, use your actual mapped port

### 2) Is Redis required?

No. Two cache modes are supported:

- `Scraper__CacheProvider=Memory`: works out of the box, good for single-instance deployments
- `Scraper__CacheProvider=Redis`: recommended for multi-instance / higher concurrency

### 3) How do I enable/disable the LLM leaderboard?

This feature is controlled by the backend feature toggle.

## 📦 Project Structure

```text
Aneiang.Pa.News/
├── docments/
├── Pa.HotNews.Api/
└── Pa.HotNews.Web/
```

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m "Add some AmazingFeature"`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

MIT License. See [LICENSE](LICENSE).

## 🙏 Acknowledgements

- [.NET](https://dotnet.microsoft.com/) - Cross-platform framework
- [Aneiang.Pa](https://pa.aneiang.com/) - Modular crawler library for .NET
- [React](https://reactjs.org/) - UI library
- [Ant Design](https://ant.design/) - UI component library
- [Vite](https://vitejs.dev/) - Frontend tooling
- [ArtificialAnalysis](https://artificialanalysis.ai/) - LLM ranking data source

## 📞 Contact

- Email: aneiang@qq.com
- Issues: https://github.com/AneiangSoft/Aneiang.Pa.News/issues
