using Aneiang.Pa.AspNetCore.Extensions;
using Aneiang.Pa.Lottery.Extensions;
using Aneiang.Pa.News.Extensions;

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

// Add and configure the ScraperController from Aneiang.Pa.AspNetCore
builder.Services.AddScraperController(options =>
{
    options.RoutePrefix = "api/scraper"; // Set a specific route prefix for news
    options.UseLowercaseInRoute = true;
    options.EnableResponseCaching = true;     // Enable response caching for performance
    options.CacheDurationSeconds = 3600;       // Cache responses for 15 minutes
});

var app = builder.Build();

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

app.Run();
