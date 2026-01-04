using Aneiang.Pa.Lottery.Extensions;
using Aneiang.Pa.News.Extensions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

// AntDesign.Blazor
builder.Services.AddAntDesign();

// 启用内存缓存（给 HotNewsLocalClient 用）
builder.Services.AddMemoryCache();

// 热榜缓存配置
builder.Services.Configure<Pa.HotNews.Blazor.Services.HotNewsCacheOptions>(
    builder.Configuration.GetSection(Pa.HotNews.Blazor.Services.HotNewsCacheOptions.SectionName));

// 直接在 Blazor Server 里注册 Aneiang.Pa 的 Scraper（不再通过 HttpClient 调用 Pa.HotNews.Api）
builder.Services.AddNewsScraper(builder.Configuration);
builder.Services.AddLotteryScraper();

builder.Services.AddScoped<Pa.HotNews.Blazor.Services.HotNewsLocalClient>();
builder.Services.AddScoped<Pa.HotNews.Blazor.Services.LocalStorageService>();

// 全局 UI 状态 / 收藏 / 来源管理
builder.Services.AddSingleton<Pa.HotNews.Blazor.Services.AppState>();
builder.Services.AddScoped<Pa.HotNews.Blazor.Services.FavoritesService>();
builder.Services.AddScoped<Pa.HotNews.Blazor.Services.SourceConfigService>();
builder.Services.AddSingleton<Pa.HotNews.Blazor.Services.SourceNameService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

app.Run();
