namespace Pa.HotNews.Blazor.Utils;

public static class TimeUtils
{
    public static string FormatTime(DateTimeOffset? time)
    {
        if (!time.HasValue) return string.Empty;

        var span = DateTimeOffset.UtcNow - time.Value;

        if (span.TotalMinutes < 1) return "刚刚";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} 分钟前";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours} 小时前";
        if (span.TotalDays < 30) return $"{(int)span.TotalDays} 天前";

        return time.Value.ToString("yyyy-MM-dd");
    }

    public static string GetFullTimeString(DateTimeOffset? time)
    {
        if (!time.HasValue) return string.Empty;
        return time.Value.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss");
    }
}

