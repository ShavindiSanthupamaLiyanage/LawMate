using LawMate.Application.Common.Interfaces;
using Microsoft.Extensions.Hosting;

namespace LawMate.Infrastructure.Services;

public class EmailTemplateService : IEmailTemplateService
{
    private readonly IHostEnvironment _environment;

    public EmailTemplateService(IHostEnvironment environment)
    {
        _environment = environment;
    }

    public string LoadTemplate(string templateName)
    {
        var path = Path.Combine(
            _environment.ContentRootPath,
            "EmailTemplates",
            templateName);

        return File.ReadAllText(path);
    }
}