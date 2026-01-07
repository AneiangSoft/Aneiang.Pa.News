using Microsoft.AspNetCore.Mvc;
using Pa.HotNews.Api.Models;

namespace Pa.HotNews.Api.Controllers;

/// <summary>
/// Site configuration endpoint.
/// Frontend can use this to dynamically display site title and footer ICP license.
/// </summary>
[ApiController]
[Route("api/site-config")]
public sealed class SiteConfigController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public SiteConfigController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet]
    public IActionResult Get()
    {
        var section = _configuration.GetSection(SiteOptions.SectionName);

        var options = new SiteOptions
        {
            Title = section["Title"],
            TitleSuffix = section["TitleSuffix"],
            IcpLicense = section["IcpLicense"],
        };

        return Ok(new
        {
            options.Title,
            options.TitleSuffix,
            options.IcpLicense,
        });
    }
}
