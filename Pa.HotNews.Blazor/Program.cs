using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Pa.HotNews.Blazor.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

// AntDesign.Blazor
builder.Services.AddAntDesign();

// HttpClient（调用 Pa.HotNews.Api）
builder.Services.AddHttpClient("HotNewsApi", client =>
{
    var baseUrl = builder.Configuration["HotNewsApi:BaseUrl"];
    if (!string.IsNullOrWhiteSpace(baseUrl))
    {
        client.BaseAddress = new Uri(baseUrl);
    }
});

builder.Services.AddScoped<Pa.HotNews.Blazor.Services.HotNewsApiClient>();
builder.Services.AddScoped<Pa.HotNews.Blazor.Services.LocalStorageService>();

// 全局 UI 状态 / 收藏 / 来源管理
builder.Services.AddSingleton<Pa.HotNews.Blazor.Services.AppState>();
builder.Services.AddScoped<Pa.HotNews.Blazor.Services.FavoritesService>();
builder.Services.AddScoped<Pa.HotNews.Blazor.Services.SourceConfigService>();
builder.Services.AddSingleton<Pa.HotNews.Blazor.Services.SourceNameService>();

// TODO: 后续会替换掉模板服务
builder.Services.AddSingleton<WeatherForecastService>();

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
