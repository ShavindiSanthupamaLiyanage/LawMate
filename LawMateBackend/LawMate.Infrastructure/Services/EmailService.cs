using System.Net;
using System.Net.Mail;
using LawMate.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace LawMate.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendAsync(string to, string subject, string body)
    {
        var smtpClient = new SmtpClient(_configuration["Email:SmtpServer"])
        {
            Port = int.Parse(_configuration["Email:Port"]),
            Credentials = new NetworkCredential(
                _configuration["Email:Username"],
                _configuration["Email:Password"]),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(_configuration["Email:From"]),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        mailMessage.To.Add(to);

        await smtpClient.SendMailAsync(mailMessage);
    }
}