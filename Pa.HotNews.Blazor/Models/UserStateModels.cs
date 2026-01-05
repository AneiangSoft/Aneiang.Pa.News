namespace Pa.HotNews.Blazor.Models;

public enum AppTheme
{
    Light,
    Dark,
    Warm
}

public sealed class SourceConfig
{
    public List<string> Order { get; set; } = new();
    public List<string> Hidden { get; set; } = new();
}

public sealed class FavoriteItem
{
    public string? Url { get; set; }
    public string? Title { get; set; }
    public string? Source { get; set; }
    public long Ts { get; set; }
}

