namespace Pa.HotNews.Blazor.Services;

/// <summary>
/// 热榜抓取缓存配置（Blazor Server 端）。
/// </summary>
public sealed class HotNewsCacheOptions
{
    public const string SectionName = "HotNews:Cache";

    /// <summary>
    /// 缓存秒数。默认 900（15分钟），对齐 Api 的 CacheDurationSeconds。
    /// </summary>
    public int DurationSeconds { get; set; } = 900;

    /// <summary>
    /// 失败结果缓存秒数。默认 30，避免频繁击穿。
    /// </summary>
    public int FailureDurationSeconds { get; set; } = 30;
}

