# 1. Build Stage: Compile and publish the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy solution and project files
COPY ["Pa.HotNews.sln", "./"]
COPY ["Pa.HotNews.Api/Pa.HotNews.Api.csproj", "Pa.HotNews.Api/"]

# Restore dependencies
RUN dotnet restore "Pa.HotNews.sln"

# Copy the rest of the application files
COPY . .

# Publish the application
WORKDIR /src/Pa.HotNews.Api
RUN dotnet publish "Pa.HotNews.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# 2. Final Stage: Create the final, smaller runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app/publish .

# Set the entrypoint for the container
ENTRYPOINT ["dotnet", "Pa.HotNews.Api.dll"]