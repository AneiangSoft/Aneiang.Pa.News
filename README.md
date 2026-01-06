<p align="center">
  <img src="docments/logo-light.svg" alt="Aneiang.Pa" width="150" style="vertical-align:middle;border-radius:8px;" />
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/caco/aneiang-pa-news)](https://hub.docker.com/r/caco/aneiang-pa-news)

一个“热点/热搜聚合”项目：后端基于 ASP.NET Core 提供聚合抓取接口，前端基于 React + Vite 展示与分享热点内容。

- 在线预览：<https://news.aneiang.com/>
- Docker 镜像：`caco/aneiang-pa-news`（建议使用固定版本 tag，例如 `:1.0.2`）

> 仓库主要包含以下项目：
> - `Pa.HotNews.Api`：ASP.NET Core Web API（聚合抓取 + 静态站点托管）
> - `Pa.HotNews.Web`：React + Vite 前端（主要）
> - `Pa.HotNews.Blazor`：AntDesign Blazor Server 前端（备选，可单独运行，不需要可以删除）

---

## 快速开始

### 方式 A：直接使用 Docker 镜像（推荐，无需下载源码）

确保已安装 Docker：<https://docs.docker.com/get-docker/>

```bash
# 拉取镜像（推荐使用固定版本）
docker pull caco/aneiang-pa-news:1.0.3

# 运行（默认端口 5000），并将日志挂载到宿主机（推荐）
# - 容器内默认日志目录：/app/logs
# - 宿主机日志目录：./logs（相对于当前命令执行目录）
mkdir -p logs

docker run -d --name aneiang-pa-news \
  -p 5000:8080 \
  -e ASPNETCORE_URLS=http://+:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e HotNews__EnableCache=true \
  -e HotNews__CacheSeconds=1800 \
  -v $(pwd)/logs:/app/logs \
  caco/aneiang-pa-news:1.0.3
```

启动后：

- Web + API（同一个服务）：`http://localhost:5000`
  - Web 首页：`http://localhost:5000/`
  - API 前缀：`http://localhost:5000/api/...`

停止/删除容器：

```bash
docker stop aneiang-pa-news
docker rm aneiang-pa-news
```

### 方式 B：Docker Compose（从源码构建）

确保已安装：Docker / Docker Compose。

在仓库根目录执行：

```bash
docker compose up -d --build
```

> compose 映射关系（见 `docker-compose.yml`）：
> - 容器内部 `8080` → 宿主机 `5000`

停止：

```bash
docker compose down
```

---

## 截图

> 点击图片可查看大图

| | |
|---|---|
| [![预览](./docments/ScreenShot_2026-01-04_114410_940.png)](./docments/ScreenShot_2026-01-04_114410_940.png) | [![预览](./docments/ScreenShot_2026-01-04_120819_009.png)](./docments/ScreenShot_2026-01-04_120819_009.png) |
| [![预览](./docments/ScreenShot_2026-01-04_120855_967.png)](./docments/ScreenShot_2026-01-04_120855_967.png) | [![预览](./docments/ScreenShot_2026-01-04_120913_719.png)](./docments/ScreenShot_2026-01-04_120913_719.png) |
| [![预览](./docments/ScreenShot_2026-01-06_152216_843.png)](./docments/ScreenShot_2026-01-06_152216_843.png) | [![预览](./docments/ScreenShot_2026-01-06_152257_133.png)](./docments/ScreenShot_2026-01-06_152257_133.png) |
| [![预览](./docments/ScreenShot_2026-01-06_152321_913.png)](./docments/ScreenShot_2026-01-06_152321_913.png) |  |

---

## 配置

### 推荐：Docker 运行时通过“挂载配置文件”配置（更适合配置项较多的场景）

当配置项逐渐变多时（例如站点标题、备案号、缓存参数、大模型 API Key 等），通过 `docker run -e ...` 写大量环境变量会很麻烦。

推荐做法：**在宿主机准备一个 `appsettings.Production.json`，运行容器时挂载到容器 `/app/appsettings.Production.json`**。

> .NET 会自动加载：`appsettings.json` → `appsettings.{ENV}.json` → 环境变量。

#### 1）宿主机准备配置文件

例如创建：`./config/appsettings.Production.json`

```json
{
  "Site": {
    "Title": "Aneiang 热榜聚合",
    "TitleSuffix": " - 全网热点实时聚合",
    "IcpLicense": "湘ICP备2023022000号-2"
  },
  "HotNews": {
    "EnableCache": true,
    "CacheSeconds": 1800
  },
  "LlmRanking": {
    "ApiKey": "你的_API_KEY_放这里（可选）"
  }
}
```

#### 2）docker run 示例（挂载配置文件）

```bash
mkdir -p logs
mkdir -p config

docker run -d --name aneiang-pa-news \
  -p 5000:8080 \
  -e ASPNETCORE_URLS=http://+:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/config/appsettings.Production.json:/app/appsettings.Production.json:ro \
  caco/aneiang-pa-news:1.0.3
```

> Windows PowerShell 挂载示例：
>
> ```powershell
> docker run -d --name aneiang-pa-news `
>   -p 5000:8080 `
>   -e ASPNETCORE_URLS=http://+:8080 `
>   -e ASPNETCORE_ENVIRONMENT=Production `
>   -v ${PWD}\logs:/app/logs `
>   -v ${PWD}\config\appsettings.Production.json:/app/appsettings.Production.json:ro `
>   caco/aneiang-pa-news:1.0.3
> ```

#### 3）docker-compose.yml（从源码构建）也可同样挂载

在 `docker-compose.yml` 的 service 下添加 volume：

```yaml
services:
  hotnews:
    # ...
    volumes:
      - ./logs:/app/logs
      - ./config/appsettings.Production.json:/app/appsettings.Production.json:ro
```

---

### 站点配置（Site）

> 通过 `GET /api/site-config` 下发给前端。

可配置项：

- `Site:Title`：导航栏标题
- `Site:TitleSuffix`：浏览器标题后缀（可选；不填时前端默认使用 ` - 全网热点实时聚合`）
- `Site:IcpLicense`：备案号（可选；不填则页脚不展示）

#### 配置示例

**1）通过环境变量配置（适合少量配置）**

> 注意：在环境变量中，配置层级分隔符使用双下划线 `__`（例如 `Site__Title`）。

```bash
docker run -d --name aneiang-pa-news \
  -p 5000:8080 \
  -e Site__Title="Aneiang 热榜聚合" \
  -e Site__TitleSuffix=" - 全网热点实时聚合" \
  -e Site__IcpLicense="湘ICP备2023022000号-2" \
  caco/aneiang-pa-news:1.0.3
```

**2）通过挂载配置文件（推荐，适合配置项较多）**

在 `./config/appsettings.Production.json` 中写入：

```json
{
  "Site": {
    "Title": "Aneiang 热榜聚合",
    "TitleSuffix": " - 全网热点实时聚合",
    "IcpLicense": "湘ICP备2023022000号-2"
  }
}
```

说明：
- 版权 **不可配置**，前端固定显示：`AneiangSoft © {当前年份}`。

---

### 缓存配置（默认 30 分钟）

可通过环境变量配置接口缓存（单位：秒）：

- `HotNews__EnableCache`：是否启用缓存（`true/false`）
- `HotNews__CacheSeconds`：缓存秒数（例如 1800 = 30 分钟）

示例：改为 5 分钟

```bash
docker run -d --name aneiang-pa-news \
  -p 5000:8080 \
  -e HotNews__EnableCache=true \
  -e HotNews__CacheSeconds=300 \
  caco/aneiang-pa-news:1.0.3
```

> 说明：当你使用“挂载 appsettings.Production.json”时，也可以用 JSON 方式配置：
>
> ```json
> {
>   "HotNews": {
>     "EnableCache": true,
>     "CacheSeconds": 300
>   }
> }
> ```

### 大模型排行榜（可选功能）

项目支持“大语言模型排行榜”页面（数据来源：<https://artificialanalysis.ai/>）。

- **默认关闭**：当未配置 `LlmRanking:ApiKey` 时，前端不会展示“大模型”入口，也无法通过 `?view=llm` 进入。
- **启用方式**：在后端配置 `LlmRanking:ApiKey` 后自动开启。

#### 配置项

- `LlmRanking:ApiKey`：ArtificialAnalysis 的 API Key（请勿提交到仓库）

#### 缓存策略

后端会对第三方接口结果做 **24 小时内存缓存**（IMemoryCache）。

#### 通过 Docker 镜像启用（docker run / 环境变量）

使用环境变量 `LlmRanking__ApiKey`（注意是双下划线 `__`）：

```bash
docker run -d --name aneiang-pa-news \
  -p 5000:8080 \
  -e ASPNETCORE_URLS=http://+:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e HotNews__EnableCache=true \
  -e HotNews__CacheSeconds=1800 \
  -e LlmRanking__ApiKey="你的_API_KEY_放这里" \
  caco/aneiang-pa-news:1.0.3
```

#### 通过挂载配置文件启用（推荐）

在 `./config/appsettings.Production.json` 中写入：

```json
{
  "LlmRanking": {
    "ApiKey": "你的_API_KEY_放这里"
  }
}
```

#### 启用后验证

- 数据接口：`GET /api/llm-ranking/models`

> 注意：容器需要能访问外网 `https://artificialanalysis.ai/`。

---

## API 说明（概要）

本项目通过 `Aneiang.Pa.AspNetCore` 的 `ScraperController` 暴露接口，并在 `Program.cs` 中配置：

- 路由前缀：`/api/scraper`
- route 小写：启用
- 响应缓存：启用（默认 1800 秒 / 30 分钟，可配置）

因此接口一般形如：

- `GET /api/scraper/...`

> 说明：`ScraperController` 来自外部依赖（`Aneiang.Pa.AspNetCore` NuGet 包），具体 endpoint 以 Swagger 显示为准。

开发环境下会启用 Swagger：

1. `cd Pa.HotNews.Api && dotnet run`
2. 打开：`http(s)://localhost:<port>/swagger`

---

## 本地开发（不使用 Docker）

### 1）启动后端 API

前置：安装 .NET SDK（建议 8.x）。

```bash
cd Pa.HotNews.Api

dotnet restore

dotnet run
```

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

## 常见问题（FAQ）

### 1）某些来源显示“加载失败”怎么办？

- 可能原因：网络波动、第三方站点限流、站点结构变动导致抓取失败。
- 解决办法：
  - 点击该来源卡片内的“重试该来源”
  - 稍等一段时间再刷新（后端默认缓存 30 分钟，短时间内频繁刷新意义不大）
  - 若长期失败，欢迎提 Issue 并附上：来源名、时间点、控制台/后端日志

### 2）Docker 启动后端口被占用？

默认端口：`5000`。如果冲突，修改端口映射即可：

```bash
# 把宿主机端口改为 15000
docker run -d --name aneiang-pa-news -p 15000:8080 caco/aneiang-pa-news:1.0.3
```

---

## 技术栈

- 后端：.NET 8 / ASP.NET Core
- 前端：React + Vite + Ant Design

---

## 变更日志

详见 [CHANGELOG.md](./CHANGELOG.md)。

---

## 许可证

本项目基于 **MIT License** 开源，详见 [LICENSE](./LICENSE)。

---

## 致谢

- `Aneiang.Pa.*` 相关组件
- React / Vite / Ant Design 等开源项目
