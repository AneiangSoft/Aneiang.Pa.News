namespace Pa.HotNews.Blazor.Services;

public sealed class SourceNameService
{
    // 英文源名 -> 中文展示名（对齐 React 版 App.jsx）
    private static readonly Dictionary<string, string> Map = new(StringComparer.OrdinalIgnoreCase)
    {
        ["zhihu"] = "知乎",
        ["weibo"] = "微博",
        ["baidu"] = "百度",
        ["douyin"] = "抖音",
        ["toutiao"] = "头条",
        ["bilibili"] = "哔哩哔哩",
        ["hupu"] = "虎扑",
        ["tencent"] = "腾讯",
        ["juejin"] = "掘金",
        ["thepaper"] = "澎湃",
        ["douban"] = "豆瓣",
        ["ifeng"] = "凤凰网",
        ["cnblog"] = "博客园",
        ["csdn"] = "CSDN",
        ["github"] = "GitHub",
        ["v2ex"] = "V2EX",
        ["tieba"] = "贴吧",
        ["36kr"] = "36氪",
    };

    public string ToDisplayName(string? source)
    {
        var key = (source ?? string.Empty).Trim().ToLowerInvariant();
        if (key.Length == 0) return string.Empty;
        return Map.TryGetValue(key, out var name) ? name : source!;
    }
}

