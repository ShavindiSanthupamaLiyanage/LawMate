using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using LawMate.Domain.Entities.User;
using MediatR;
using Microsoft.EntityFrameworkCore;

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
    private readonly IEmailService _emailService;

    public RequestPasswordResetCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
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

        await _emailService.SendAsync(
            request.Email,
            "Password Reset Code",
            $"Your LawMate password reset code is: {otp}");

        return "Verification email sent.";
    }
}