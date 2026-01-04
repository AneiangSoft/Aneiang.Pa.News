using System.Text.Json;

namespace Pa.HotNews.Blazor.Models;

public sealed class SourcesResponse
{
    public List<string> Sources { get; set; } = new();
}

public sealed class NewsItem
{
    public string? Title { get; set; }
    public string? Url { get; set; }

    // 兼容后端更多字段
    public string? Id { get; set; }
    public string? MobileUrl { get; set; }
    public string? ExtensionData { get; set; }
}

/// <summary>
/// 兼容后端两种返回：
/// 1) { data: [ {title,url}, ... ], updatedTime: "..." }
/// 2) { data: { items: [..], updatedTime: "..." }, updatedTime: "..." }
/// </summary>
public sealed class NewsResponse
{
    public object? Data { get; set; }

    public DateTimeOffset? UpdatedTime { get; set; }

    // 少数后端会用不同字段名
    public DateTimeOffset? UpdateTime { get; set; }

    private static readonly JsonSerializerOptions ItemJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public List<NewsItem> ExtractItems()
    {
        if (Data is null) return new List<NewsItem>();

        // System.Text.Json 反序列化到 object 时通常是 JsonElement
        if (Data is not JsonElement je) return new List<NewsItem>();

        if (je.ValueKind == JsonValueKind.Array)
        {
            return DeserializeItemsFromElement(je);
        }

        if (je.ValueKind == JsonValueKind.Object)
        {
            // 期待 { items: [], updatedTime: ... }
            if (je.TryGetProperty("items", out var itemsEl) && itemsEl.ValueKind == JsonValueKind.Array)
            {
                return DeserializeItemsFromElement(itemsEl);
            }
        }

        return new List<NewsItem>();
    }

    private static List<NewsItem> DeserializeItemsFromElement(JsonElement arrayElement)
    {
        try
        {
            // 关键点：直接反序列化 JsonElement，避免 GetRawText + 编码/转义导致的异常情况
            var list = JsonSerializer.Deserialize<List<NewsItem>>(arrayElement, ItemJsonOptions);
            return list ?? new List<NewsItem>();
        }
        catch
        {
            return new List<NewsItem>();
        }
    }

    public DateTimeOffset? ExtractUpdatedTime()
    {
        return UpdatedTime ?? UpdateTime;
    }
}
