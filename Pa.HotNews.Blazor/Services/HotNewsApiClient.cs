using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Pa.HotNews.Blazor.Models;

namespace Pa.HotNews.Blazor.Services;

public sealed class HotNewsApiClient
{
    private readonly IHttpClientFactory _httpClientFactory;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public HotNewsApiClient(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    private HttpClient CreateClient() => _httpClientFactory.CreateClient("HotNewsApi");

    public async Task<List<string>> GetSourcesAsync(CancellationToken ct = default)
    {
        var http = CreateClient();
        var res = await http.GetFromJsonAsync<SourcesResponse>("api/scraper/news/sources", JsonOptions, ct);
        return res?.Sources ?? new List<string>();
    }

    public async Task<NewsResponse?> GetNewsRawAsync(string source, bool bustCache = false, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(source)) return null;

        var http = CreateClient();
        var url = $"api/scraper/news/{Uri.EscapeDataString(source.ToLowerInvariant())}";

        if (bustCache)
        {
            var d = DateTimeOffset.Now;
            var v = $"{d:yyyyMMddHHmm}";
            url += (url.Contains('?') ? "&" : "?") + "v=" + v;
        }

        // 1. 读取原始 byte[]
        var bytes = await http.GetByteArrayAsync(url, ct);

        // 2. 强制用 UTF-8 解码
        var jsonString = Encoding.UTF8.GetString(bytes);

        // 3. 用解码后的字符串反序列化
        return JsonSerializer.Deserialize<NewsResponse>(jsonString, JsonOptions);
    }
}
