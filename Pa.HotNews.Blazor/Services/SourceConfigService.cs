using Pa.HotNews.Blazor.Models;

namespace Pa.HotNews.Blazor.Services;

public sealed class SourceConfigService
{
    private const string SOURCE_CFG_KEY = "sourceConfigV1";

    private readonly LocalStorageService _localStorage;

    public event Action? Changed;

    public SourceConfig Config { get; private set; } = new();

    public SourceConfigService(LocalStorageService localStorage)
    {
        _localStorage = localStorage;
    }

    public async Task InitializeAsync(IEnumerable<string>? allSources)
    {
        var cfg = await _localStorage.GetJsonAsync<SourceConfig>(SOURCE_CFG_KEY) ?? new SourceConfig();

        // 规范化：小写 + 同步新增/删除
        var normalized = (allSources ?? Array.Empty<string>())
            .Select(s => (s ?? string.Empty).Trim().ToLowerInvariant())
            .Where(s => s.Length > 0)
            .ToList();

        cfg.Order = (cfg.Order ?? new List<string>())
            .Select(s => (s ?? string.Empty).Trim().ToLowerInvariant())
            .Where(s => normalized.Contains(s))
            .Distinct()
            .ToList();

        foreach (var s in normalized)
        {
            if (!cfg.Order.Contains(s)) cfg.Order.Add(s);
        }

        cfg.Hidden = (cfg.Hidden ?? new List<string>())
            .Select(s => (s ?? string.Empty).Trim().ToLowerInvariant())
            .Where(s => normalized.Contains(s))
            .Distinct()
            .ToList();

        Config = cfg;
        await PersistAsync();
        Changed?.Invoke();
    }

    public IEnumerable<string> GetDisplaySources(IEnumerable<string> allSources)
    {
        var normalized = allSources
            .Select(s => (s ?? string.Empty).Trim().ToLowerInvariant())
            .Where(s => s.Length > 0)
            .Distinct()
            .ToList();

        var order = (Config.Order ?? new List<string>()).Where(normalized.Contains).ToList();
        foreach (var s in normalized)
        {
            if (!order.Contains(s)) order.Add(s);
        }

        var hidden = new HashSet<string>((Config.Hidden ?? new List<string>()), StringComparer.OrdinalIgnoreCase);
        return order.Where(s => !hidden.Contains(s));
    }

    public bool IsHidden(string source)
    {
        return (Config.Hidden ?? new List<string>()).Contains(source, StringComparer.OrdinalIgnoreCase);
    }

    public async Task SetVisibleAsync(string source, bool visible)
    {
        source = (source ?? string.Empty).Trim().ToLowerInvariant();
        if (source.Length == 0) return;

        var hidden = new HashSet<string>(Config.Hidden ?? new List<string>(), StringComparer.OrdinalIgnoreCase);
        if (visible) hidden.Remove(source);
        else hidden.Add(source);

        Config.Hidden = hidden.ToList();
        await PersistAsync();
        Changed?.Invoke();
    }

    public async Task MoveAsync(string source, int dir)
    {
        source = (source ?? string.Empty).Trim().ToLowerInvariant();
        if (source.Length == 0) return;

        var order = Config.Order ?? new List<string>();
        var idx = order.FindIndex(s => string.Equals(s, source, StringComparison.OrdinalIgnoreCase));
        if (idx < 0) return;

        var next = idx + dir;
        if (next < 0 || next >= order.Count) return;

        (order[idx], order[next]) = (order[next], order[idx]);
        Config.Order = order;
        await PersistAsync();
        Changed?.Invoke();
    }

    public async Task ResetAsync(IEnumerable<string> allSources)
    {
        var normalized = allSources
            .Select(s => (s ?? string.Empty).Trim().ToLowerInvariant())
            .Where(s => s.Length > 0)
            .Distinct()
            .ToList();

        Config = new SourceConfig
        {
            Order = normalized,
            Hidden = new List<string>()
        };

        await PersistAsync();
        Changed?.Invoke();
    }

    private async Task PersistAsync()
    {
        await _localStorage.SetJsonAsync(SOURCE_CFG_KEY, Config);
    }
}

