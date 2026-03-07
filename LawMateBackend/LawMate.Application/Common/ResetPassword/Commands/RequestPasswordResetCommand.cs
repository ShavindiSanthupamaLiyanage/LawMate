using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using LawMate.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace LawMate.Application.Common.ResetPassword.Commands;

public class RequestPasswordResetCommand : IRequest<string>
{
    public string NIC { get; set; }
    public string Email { get; set; } 
}

public class RequestPasswordResetCommandHandler 
    : IRequestHandler<RequestPasswordResetCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;

    public RequestPasswordResetCommandHandler(
        IApplicationDbContext context,
        IConfiguration configuration,
        IEmailService emailService,
        IEmailTemplateService templateService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _templateService = templateService;
    }

    public async Task<string> Handle(
        RequestPasswordResetCommand request,
        CancellationToken cancellationToken)
    {
        var normalizedNic = NicUtil.ValidateAndNormalize(request.NIC);

        var user = await _context.USER_DETAIL
            .FirstOrDefaultAsync(x =>
                    x.NIC == normalizedNic &&
                    x.Email == request.Email &&
                    x.RecordStatus == 0,
                cancellationToken);

        if (user == null)
            throw new Exception("Invalid NIC or Email.");

        // Generate secure token - otp
        var otp = new Random().Next(100000, 999999).ToString();

        var resetToken = new PASSWORD_RESET_TOKEN
        {
            UserId = user.UserId,
            Token = otp,
            ExpiryDate = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = user.UserId
        };

        _context.PASSWORD_RESET_TOKEN.Add(resetToken);
        await _context.SaveChangesAsync(cancellationToken);

        var template = _templateService.LoadTemplate("PasswordResetTemplate.html");

        var logoUrl = $"{_configuration["App:BaseUrl"]}/assets/logo.png";

        template = template
            .Replace("{{OTP}}", otp)
            .Replace("{{LogoUrl}}", logoUrl);

        await _emailService.SendAsync(
            request.Email,
            "LawMate Password Reset Code",
            template
        );
        
        return "Verification email sent.";
    }
}