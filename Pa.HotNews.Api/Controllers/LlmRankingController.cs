using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Serilog;

namespace Pa.HotNews.Api.Controllers;

[ApiController]
[Route("api/llm-ranking")]
public sealed class LlmRankingController : ControllerBase
{
    private const string CacheKeyModels = "llm-ranking:models:v1";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromHours(24);

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMemoryCache _cache;
    private readonly IConfiguration _configuration;

    public LlmRankingController(
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _cache = cache;
        _configuration = configuration;
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

        // 优先从缓存读取
        if (_cache.TryGetValue(CacheKeyModels, out string? cached) && !string.IsNullOrWhiteSpace(cached))
        {
            return Content(cached, "application/json");
        }

        try
        {
            var client = _httpClientFactory.CreateClient("ArtificialAnalysis");

            using var req = new HttpRequestMessage(HttpMethod.Get, "api/v2/data/llms/models");
            req.Headers.Add("x-api-key", apiKey);
            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            using var resp = await client.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            var body = await resp.Content.ReadAsStringAsync(cancellationToken);

            if (!resp.IsSuccessStatusCode)
            {
                Log.Warning("LLM Ranking upstream failed. Status={StatusCode}, Body={Body}", (int)resp.StatusCode, body);
                return StatusCode((int)resp.StatusCode, new { message = "上游接口返回错误", upstreamStatus = (int)resp.StatusCode, upstreamBody = body });
            }

            // 写入缓存
            _cache.Set(CacheKeyModels, body, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = CacheTtl
            });

            return Content(body, "application/json");
        }
        catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            Log.Warning(ex, "LLM Ranking upstream timeout");
            return StatusCode(StatusCodes.Status504GatewayTimeout, new { message = "上游接口超时" });
        }
        catch (Exception ex)
        {
            Log.Error(ex, "LLM Ranking proxy error");
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "获取大模型排行失败" });
        }
    }

    /// <summary>
    /// 手动刷新缓存（可选：用于调试/运维）
    /// </summary>
    [HttpPost("models/refresh")]
    public IActionResult RefreshModels()
    {
        _cache.Remove(CacheKeyModels);
        return Ok(new { message = "缓存已清除" });
    }
}
