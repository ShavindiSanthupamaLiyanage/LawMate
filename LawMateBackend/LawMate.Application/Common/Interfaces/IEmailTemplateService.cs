namespace LawMate.Application.Common.Interfaces;

public interface IEmailTemplateService
{
    string LoadTemplate(string templateName);
}