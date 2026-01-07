using Aneiang.Pa.AspNetCore.Extensions;
using Aneiang.Pa.Lottery.Extensions;
using Aneiang.Pa.News.Extensions;
using Microsoft.Extensions.FileProviders;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

// 0. Configure logging (Serilog)
// - Console output in structured JSON-like format is recommended for Docker / K8s log collection
// - Log level can be controlled via appsettings / environment variables (Serilog section)
var logDir = builder.Configuration["LOG_DIR"]
             ?? builder.Configuration["HotNews:LogDir"]
             ?? Path.Combine(AppContext.BaseDirectory, "logs");
Directory.CreateDirectory(logDir);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    // Rolling file logs (Beijing time is handled by container TZ=Asia/Shanghai)
    .WriteTo.File(
        path: Path.Combine(logDir, "hotnews-.log"),
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 14,
        rollOnFileSizeLimit: true,
        fileSizeLimitBytes: 50 * 1024 * 1024,
        shared: true,
        flushToDiskInterval: TimeSpan.FromSeconds(1),
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog(Log.Logger, dispose: true);

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

// HttpClient + 内存缓存（用于第三方 LLM 排行接口代理与 24h 缓存）
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient("ArtificialAnalysis", client =>
{
    client.BaseAddress = new Uri("https://artificialanalysis.ai/");
    client.Timeout = TimeSpan.FromSeconds(30);
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Register Aneiang.Pa services

// Register all news scrapers from Aneiang.Pa.News
builder.Services.AddNewsScraper(builder.Configuration);
builder.Services.AddLotteryScraper();

// Add and configure the ScraperController from Aneiang.Pa.AspNetCore
builder.Services.AddPaScraperApi(builder.Configuration).AddPaScraperAuthorization(builder.Configuration);

var app = builder.Build();

// === Dump basic configuration on startup (Scraper:*, LlmRanking:*, Site:*) ===
static string MaskSecret(string? value)
{
    if (string.IsNullOrWhiteSpace(value)) return "(empty)";
    if (value.Length <= 6) return "***";
    return value[..3] + "***" + value[^2..];
}

static void DumpSection(IConfiguration config, string sectionName)
{
    var section = config.GetSection(sectionName);
    if (!section.Exists())
    {
        Log.Information("Config Section {Section} => (not exists)", sectionName);
        return;
    }

    foreach (var kv in section.AsEnumerable().Where(x => x.Value != null))
    {
        var masked = kv.Key.Contains("key", StringComparison.OrdinalIgnoreCase)
                     || kv.Key.Contains("secret", StringComparison.OrdinalIgnoreCase)
                     || kv.Key.Contains("password", StringComparison.OrdinalIgnoreCase)
                     || kv.Key.Contains("token", StringComparison.OrdinalIgnoreCase);

        var v = masked ? MaskSecret(kv.Value) : kv.Value;
        Log.Information("Config {Key} = {Value}", kv.Key, v);
    }
}

Log.Information("ENV ASPNETCORE_ENVIRONMENT = {Env}", builder.Environment.EnvironmentName);
DumpSection(builder.Configuration, "Scraper");
DumpSection(builder.Configuration, "LlmRanking");
DumpSection(builder.Configuration, "Site");

// 3. Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors();

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

    Log.Information("Static Web Enabled: true (wwwroot found)");
}
else
{
    Log.Information("Static Web Enabled: false (wwwroot not found)");
}

try
{
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
