# =========================
# Stage 1: Build Web (React/Vite)
# =========================
FROM node:20-alpine AS web-build
WORKDIR /src

# Install deps
COPY Pa.HotNews.Web/package*.json ./Pa.HotNews.Web/
WORKDIR /src/Pa.HotNews.Web
RUN npm install

# Build
COPY Pa.HotNews.Web/ ./
RUN npm run build

# =========================
# Stage 2: Build API (.NET)
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS api-build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy solution and project files
COPY Pa.HotNews.sln ./
COPY Pa.HotNews.Api/Pa.HotNews.Api.csproj Pa.HotNews.Api/

# Restore dependencies
RUN dotnet restore Pa.HotNews.sln

# Copy the rest of the source
COPY . .

# Copy web build output into API wwwroot
# Vite default output is dist/
COPY --from=web-build /src/Pa.HotNews.Web/dist /src/Pa.HotNews.Api/wwwroot

# Publish API
WORKDIR /src/Pa.HotNews.Api
RUN dotnet publish Pa.HotNews.Api.csproj -c ${BUILD_CONFIGURATION} -o /app/publish /p:UseAppHost=false

# =========================
# Stage 3: Runtime
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=api-build /app/publish .

# ASP.NET Core default container port
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Pa.HotNews.Api.dll"]

