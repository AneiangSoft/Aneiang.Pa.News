using System.Text.Json;
using Microsoft.JSInterop;

namespace Pa.HotNews.Blazor.Services;

public sealed class LocalStorageService
{
    private readonly IJSRuntime _js;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public LocalStorageService(IJSRuntime js)
    {
        _js = js;
    }

    public async Task<string?> GetStringAsync(string key)
    {
        return await _js.InvokeAsync<string?>("hotnewsLocalStorage.get", key);
    }

    public async Task SetStringAsync(string key, string value)
    {
        await _js.InvokeVoidAsync("hotnewsLocalStorage.set", key, value);
    }

    public async Task RemoveAsync(string key)
    {
        await _js.InvokeVoidAsync("hotnewsLocalStorage.remove", key);
    }

    public async Task<T?> GetJsonAsync<T>(string key)
    {
        var raw = await GetStringAsync(key);
        if (string.IsNullOrWhiteSpace(raw)) return default;

        try
        {
            return JsonSerializer.Deserialize<T>(raw, JsonOptions);
        }
        catch
        {
            return default;
        }
    }

    public async Task SetJsonAsync<T>(string key, T value)
    {
        var raw = JsonSerializer.Serialize(value, JsonOptions);
        await SetStringAsync(key, raw);
    }
}

