using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.LawyerVerification.Commands;

public class AcceptLawyerVerificationCommand : IRequest<string>
{
    public string UserId { get; set; }
    public string AdminUserId { get; set; }
}

public class AcceptLawyerVerificationCommandHandler 
    : IRequestHandler<AcceptLawyerVerificationCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;

    public AcceptLawyerVerificationCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IEmailTemplateService templateService)
    {
        _context = context;
        _emailService = emailService;
        _templateService = templateService;
    }

    public async Task<string> Handle(
        AcceptLawyerVerificationCommand request,
        CancellationToken cancellationToken)
    {
        var lawyer = await _context.LAWYER_DETAILS
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        if (lawyer == null)
            throw new Exception("Lawyer not found");

        lawyer.VerificationStatus = VerificationStatus.Verified;
        lawyer.VerifiedBy = request.AdminUserId;
        lawyer.VerifiedAt = DateTime.UtcNow;
        lawyer.RejectedReason = null;

        var user = await _context.USER_DETAIL
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        if (user != null)
        {
            user.State = State.Pending;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Send Email
        if (user != null)
        {
            var template = _templateService.LoadTemplate("LawyerVerified.html");

            template = template
                .Replace("{{Name}}", user.FirstName)
                .Replace("{{LogoUrl}}", "https://yourdomain.com/logo.png");

            await _emailService.SendAsync(
                user.Email,
                "LawMate Lawyer Verification Approved",
                template);
        }

        return "Lawyer verified successfully";
    }
}