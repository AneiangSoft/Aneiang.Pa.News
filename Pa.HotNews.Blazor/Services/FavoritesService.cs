using Pa.HotNews.Blazor.Models;

namespace Pa.HotNews.Blazor.Services;

public sealed class FavoritesService
{
    private const string FAVORITE_KEY = "favoriteNews";

    private readonly LocalStorageService _localStorage;

    // key: url
    private Dictionary<string, FavoriteItem> _map = new(StringComparer.OrdinalIgnoreCase);

    public event Action? Changed;

    public FavoritesService(LocalStorageService localStorage)
    {
        _localStorage = localStorage;
    }

    public int Count => _map.Count;

    public IReadOnlyCollection<FavoriteItem> Items => _map.Values;

    public bool IsFavorited(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        return _map.ContainsKey(url);
    }

    public async Task InitializeAsync()
    {
        var obj = await _localStorage.GetJsonAsync<Dictionary<string, FavoriteItem>>(FAVORITE_KEY);
        _map = obj ?? new Dictionary<string, FavoriteItem>(StringComparer.OrdinalIgnoreCase);
        Changed?.Invoke();
    }

    public async Task ToggleAsync(string? url, string? title, string? source)
    {
        if (string.IsNullOrWhiteSpace(url)) return;

        if (_map.ContainsKey(url))
        {
            _map.Remove(url);
        }
        else
        {
            _map[url] = new FavoriteItem
            {
                Url = url,
                Title = title,
                Source = source,
                Ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };
        }

        await PersistAsync();
        Changed?.Invoke();
    }

    public async Task ClearAsync()
    {
        _map.Clear();
        await PersistAsync();
        Changed?.Invoke();
    }

    private async Task PersistAsync()
    {
        await _localStorage.SetJsonAsync(FAVORITE_KEY, _map);
    }
}

