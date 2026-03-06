using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace LawMate.Application.ClientModule.ContactUs.Commands;

public class SendContactUsMessageCommand : IRequest<bool>
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Subject { get; set; }
    public string Message { get; set; }
}

public class SendContactUsMessageCommandHandler 
    : IRequestHandler<SendContactUsMessageCommand, bool>
{
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public SendContactUsMessageCommandHandler(
        IEmailService emailService,
        IConfiguration configuration)
    {
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<bool> Handle(SendContactUsMessageCommand request, CancellationToken cancellationToken)
    {
        var lawMateEmail = _configuration["Email:From"]; // LawMate email

        var emailBody = $@"
            <h2>New Contact Us Message</h2>
            <p><b>Name:</b> {request.FullName}</p>
            <p><b>Email:</b> {request.Email}</p>
            <p><b>Subject:</b> {request.Subject}</p>
            <p><b>Message:</b></p>
            <p>{request.Message}</p>
        ";

        // Send message to LawMate inbox
        await _emailService.SendAsync(
            lawMateEmail,
            $"Contact Us: {request.Subject}",
            emailBody
        );
        
        // Send confirmation email to the user
        await _emailService.SendAsync(
            request.Email,
            "LawMate Support - We received your message",
            @"<p>Thank you for contacting LawMate.</p>
          <p>Our team has received your message and will respond soon.</p>
          <br/>
          <p>Best Regards,<br/>LawMate Team</p>"
        );

        return true;
    }
}