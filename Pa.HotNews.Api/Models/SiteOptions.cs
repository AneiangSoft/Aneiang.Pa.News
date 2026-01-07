namespace Pa.HotNews.Api.Models;

/// <summary>
/// Represents site-wide configuration options.
/// </summary>
public class SiteOptions
{
    public const string SectionName = "Site";

    /// <summary>
    /// Nav/header title (short name), e.g. "Aneiang 热榜聚合".
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Browser/document title suffix, e.g. " - 全网热点实时聚合".
    /// </summary>
    public string? TitleSuffix { get; set; }

    /// <summary>
    /// ICP license number, e.g., "湘ICP备2023022000号-2".
    /// </summary>
    public string? IcpLicense { get; set; }
}
