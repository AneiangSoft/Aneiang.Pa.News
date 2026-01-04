using Aneiang.Pa.Core.News;
using Aneiang.Pa.Core.News.Models;
using Aneiang.Pa.News.Models;
using Aneiang.Pa.News.News;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Pa.HotNews.Blazor.Services;

/// <summary>
/// Blazor Server 端直连 Aneiang.Pa.News 的新闻抓取服务（强类型）。
/// </summary>
public sealed class HotNewsLocalClient
{
    private readonly INewsScraperFactory _scraperFactory;
    private readonly IMemoryCache _cache;
    private readonly HotNewsCacheOptions _cacheOptions;

    public HotNewsLocalClient(
        INewsScraperFactory scraperFactory,
        IMemoryCache cache,
        IOptions<HotNewsCacheOptions> cacheOptions)
    {
        _scraperFactory = scraperFactory;
        _cache = cache;
        _cacheOptions = cacheOptions.Value ?? new HotNewsCacheOptions();
    }

    public Task<List<string>> GetSourcesAsync(CancellationToken ct = default)
    {
        _ = ct;

        // 直接基于 ScraperSource 枚举提供来源列表
        var sources = Enum.GetNames(typeof(ScraperSource))
            .Select(x => x.Trim())
            .Where(x => x.Length > 0)
            .ToList();

        return Task.FromResult(sources);
    }

    public async Task<AneiangGenericListResult<NewsItem>?> GetNewsAsync(
        string source,
        bool bustCache = false,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(source)) return null;

        var key = (source ?? string.Empty).Trim().ToLowerInvariant();
        if (key.Length == 0) return null;

        var cacheKey = $"hotnews:news:{key}";

        if (!bustCache && _cache.TryGetValue(cacheKey, out AneiangGenericListResult<NewsItem>? cached) && cached is not null)
            return cached;

        AneiangGenericListResult<NewsItem> result;
        try
        {
            if (!Enum.TryParse<ScraperSource>(source, ignoreCase: true, out var src))
                result = AneiangGenericListResult<NewsItem>.Failure($"未知来源：{source}");
            else
            {
                var scraper = _scraperFactory.GetScraper(src);
                // INewsScraper 接口：GetNewsAsync()
                result = await scraper.GetNewsAsync();
            }
        }
        catch (Exception ex)
        {
            result = AneiangGenericListResult<NewsItem>.Failure(ex.Message);
        }

        // 成功/失败不同缓存时长：避免失败时长时间“坏缓存”
        var durationSeconds = result.IsSuccessd
            ? _cacheOptions.DurationSeconds
            : _cacheOptions.FailureDurationSeconds;

        if (durationSeconds <= 0)
        {
            // <=0 表示不缓存
            return result;
        }

        _cache.Set(cacheKey, result, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(durationSeconds)
        });

        return result;
    }
}
