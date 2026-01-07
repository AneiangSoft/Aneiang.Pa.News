using Aneiang.Pa.AspNetCore.Caching;
using Aneiang.Pa.AspNetCore.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Serilog;
using System.Net.Http.Headers;

namespace Pa.HotNews.Api.Controllers;

[ApiController]
[Route("api/llm-ranking")]
public sealed class LlmRankingController : ControllerBase
{
    private const string CacheKeyModels = "llm-ranking:models:v1";
    private readonly ScraperControllerOptions _options;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ICacheService _cache;

    public LlmRankingController(
        IHttpClientFactory httpClientFactory,
        ICacheService cache,
        IConfiguration configuration,
        IOptions<ScraperControllerOptions> options)
    {
        _httpClientFactory = httpClientFactory;
        _cache = cache;
        _configuration = configuration;
        _options = options?.Value ?? new ScraperControllerOptions();
    }

    /// <summary>
    /// 检查“大模型排行”功能是否已配置/启用
    /// </summary>
    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var apiKey = _configuration["LlmRanking:ApiKey"];
        var isEnabled = !string.IsNullOrWhiteSpace(apiKey);
        return Ok(new { LlmRankingEnabled = isEnabled });
    }

    /// <summary>
    /// 获取大模型排行数据（代理 third-party，并缓存 24 小时）
    /// </summary>
    [HttpGet("models")]
    public async Task<IActionResult> GetModels(CancellationToken cancellationToken)
    {
        var apiKey = _configuration["LlmRanking:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            // 424 Failed Dependency: The method could not be performed on the resource because the requested action depended on another action and that action failed.
            return StatusCode(StatusCodes.Status424FailedDependency, new { message = "功能未配置", detail = "LlmRanking:ApiKey is not configured on the server." });
        }

        var result = await _cache.GetOrCreateAsync(CacheKeyModels, async () =>
        {
            try
            {
                var client = _httpClientFactory.CreateClient("ArtificialAnalysis");
                using var req = new HttpRequestMessage(HttpMethod.Get, "api/v2/data/llms/models");
                req.Headers.Add("x-api-key", apiKey);
                req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                using var resp = await client.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
                var body = await resp.Content.ReadAsStringAsync(cancellationToken);
                if (resp.IsSuccessStatusCode) return body;
                Log.Warning("LLM Ranking upstream failed. Status={StatusCode}, Body={Body}", (int)resp.StatusCode, body);
                return null;
            }
            catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
            {
                Log.Warning(ex, "LLM Ranking upstream timeout");
                return null;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "LLM Ranking proxy error");
                return null;
            }
        }, TimeSpan.FromDays(1));
        if (result == null)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "获取大模型排行失败" });
        }
        return Content(result, "application/json");
    }

    /// <summary>
    /// 手动刷新缓存（可选：用于调试/运维）
    /// </summary>
    [HttpPost("models/refresh")]
    public async Task<IActionResult> RefreshModels()
    {
        await _cache.RemoveAsync(CacheKeyModels);
        return Ok(new { message = "缓存已清除" });
    }
}
