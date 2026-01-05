using Aneiang.Pa.AspNetCore.Extensions;
using Aneiang.Pa.Lottery.Extensions;
using Aneiang.Pa.News.Extensions;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container.

// Add CORS services to allow requests from the frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin() // In production, you should restrict this to your frontend's domain
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Register Aneiang.Pa services

// Register all news scrapers from Aneiang.Pa.News
builder.Services.AddNewsScraper(builder.Configuration);
builder.Services.AddLotteryScraper();

// 读取可配置的缓存参数（支持 appsettings.json / 环境变量覆盖）
// 环境变量示例：
//   HOTNEWS_CACHE_SECONDS=1800
//   HOTNEWS_ENABLE_CACHE=true
// 或使用 .NET 配置层级：
//   HotNews__CacheSeconds=1800
//   HotNews__EnableCache=true
var cacheSeconds = builder.Configuration.GetValue<int?>("HotNews:CacheSeconds")
                   ?? builder.Configuration.GetValue<int?>("HOTNEWS_CACHE_SECONDS")
                   ?? 3600;
var enableCache = builder.Configuration.GetValue<bool?>("HotNews:EnableCache")
                  ?? builder.Configuration.GetValue<bool?>("HOTNEWS_ENABLE_CACHE")
                  ?? true;

// Add and configure the ScraperController from Aneiang.Pa.AspNetCore
builder.Services.AddScraperController(options =>
{
    options.RoutePrefix = "api/scraper"; // Set a specific route prefix for news
    options.UseLowercaseInRoute = true;
    options.EnableResponseCaching = enableCache; // Enable response caching for performance
    options.CacheDurationSeconds = cacheSeconds; // 缓存秒数（可配置）
});

var app = builder.Build();

// 启动日志：输出基础运行配置，便于排查部署问题
app.Logger.LogInformation("===== Aneiang.Pa.News (HotNews) Startup =====");
app.Logger.LogInformation("Environment: {EnvironmentName}", app.Environment.EnvironmentName);
app.Logger.LogInformation("ContentRoot: {ContentRoot}", app.Environment.ContentRootPath);
app.Logger.LogInformation("WebRoot: {WebRoot}", app.Environment.WebRootPath);
app.Logger.LogInformation("Cache Enabled: {EnableCache}", enableCache);
app.Logger.LogInformation("Cache Seconds: {CacheSeconds}", cacheSeconds);
app.Logger.LogInformation("API Route Prefix: /{RoutePrefix}", "api/scraper");
app.Logger.LogInformation("ASPNETCORE_URLS: {Urls}", builder.Configuration["ASPNETCORE_URLS"] ?? "(not set)");
app.Logger.LogInformation("HTTPS Redirection Enabled: true");
app.Logger.LogInformation("Swagger Enabled (Development only): {SwaggerEnabled}", app.Environment.IsDevelopment());
app.Logger.LogInformation("============================================");

// 3. Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors();

// Enable Response Caching middleware
app.UseResponseCaching();

app.UseAuthorization();

app.MapControllers();

// 4. Add static files and SPA fallback
var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
if (Directory.Exists(wwwrootPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(wwwrootPath),
        RequestPath = ""
    });

    // SPA 路由回退：对所有非 /api 的路由返回 index.html（用于 React Router 等前端路由）
    app.MapFallbackToFile("index.html");

    app.Logger.LogInformation("Static Web Enabled: true (wwwroot found)");
}
else
{
    app.Logger.LogInformation("Static Web Enabled: false (wwwroot not found)");
}

app.Run();
