using Pa.HotNews.Blazor.Models;

namespace Pa.HotNews.Blazor.Services;

/// <summary>
/// 简单的全局 UI 状态（搜索词、主题、以及跨组件事件）。
/// </summary>
public sealed class AppState
{
    public string Query { get; private set; } = string.Empty;

    // light | dark | warm
    public string Theme { get; private set; } = "light";

    public event Action? Changed;

    // 事件：打开抽屉
    public event Action? ShowFavoritesRequested;
    public event Action? ShowSourceManagerRequested;

    public void SetQuery(string? query)
    {
        Query = (query ?? string.Empty);
        Changed?.Invoke();
    }

    public void SetTheme(string? theme)
    {
        if (theme is not ("dark" or "light" or "warm"))
            theme = "light";

        Theme = theme;
        Changed?.Invoke();
    }

    public void RequestShowFavorites() => ShowFavoritesRequested?.Invoke();

    public void RequestShowSourceManager() => ShowSourceManagerRequested?.Invoke();
}
