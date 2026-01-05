# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["Pa.HotNews.Blazor/Pa.HotNews.Blazor.csproj", "Pa.HotNews.Blazor/"]
RUN dotnet restore "Pa.HotNews.Blazor/Pa.HotNews.Blazor.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/Pa.HotNews.Blazor"
RUN dotnet build "Pa.HotNews.Blazor.csproj" -c Release -o /app/build

# 2. Publish Stage
FROM build AS publish
RUN dotnet publish "Pa.HotNews.Blazor.csproj" -c Release -o /app/publish \
    --no-restore \
    -p:UseAppHost=false

# 3. Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# 设置中国时区
ENV TZ=Asia/Shanghai

# 安装 tzdata 以确保时区生效（避免容器内仍为 UTC）
RUN apt-get update && apt-get install -y tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# 复制发布文件
COPY --from=publish /app/publish .

# 暴露端口（默认 8080，可以在 docker run 时用 -p 参数映射）
EXPOSE 8080

# 设置环境变量
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# 设置入口点
ENTRYPOINT ["dotnet", "Pa.HotNews.Blazor.dll"]
