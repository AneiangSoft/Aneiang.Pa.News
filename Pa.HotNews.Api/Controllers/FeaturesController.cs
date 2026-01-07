using Microsoft.AspNetCore.Mvc;

namespace Pa.HotNews.Api.Controllers;

/// <summary>
/// 功能开关（Feature Flags）
/// - 前端用于决定是否展示某些功能入口
/// - 统一在此处输出，便于后续扩展
/// </summary>
[ApiController]
[Route("api/features")]
public sealed class FeaturesController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public FeaturesController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet]
    public IActionResult Get()
    {
        // 大模型排行：需要配置 LlmRanking:ApiKey
        var llmRanking = !string.IsNullOrWhiteSpace(_configuration["LlmRanking:ApiKey"]);

        return Ok(new
        {
            llmRanking
        });
    }
}

