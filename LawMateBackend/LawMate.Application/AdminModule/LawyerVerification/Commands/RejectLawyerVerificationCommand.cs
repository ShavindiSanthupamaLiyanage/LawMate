using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.LawyerVerification.Commands;

public class RejectLawyerVerificationCommand : IRequest<string>
{
    public string UserId { get; set; }
    public string AdminUserId { get; set; }
    public string RejectedReason { get; set; }
}

public class RejectLawyerVerificationCommandHandler 
    : IRequestHandler<RejectLawyerVerificationCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;

    public RejectLawyerVerificationCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IEmailTemplateService templateService)
    {
        _context = context;
        _emailService = emailService;
        _templateService = templateService;
    }

    public async Task<string> Handle(
        RejectLawyerVerificationCommand request,
        CancellationToken cancellationToken)
    {
        var lawyer = await _context.LAWYER_DETAILS
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        if (lawyer == null)
            throw new Exception("Lawyer not found");

        lawyer.VerificationStatus = VerificationStatus.Rejected;
        lawyer.VerifiedBy = request.AdminUserId;
        lawyer.VerifiedAt = DateTime.UtcNow;
        lawyer.RejectedReason = request.RejectedReason;

        var user = await _context.USER_DETAIL
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        // Send rejection email
        if (user != null)
        {
            var template = _templateService.LoadTemplate("LawyerRejected.html");

            template = template
                .Replace("{{Name}}", user.FirstName)
                .Replace("{{RejectedReason}}", request.RejectedReason)
                .Replace("{{LogoUrl}}", "https://yourdomain.com/logo.png");

            await _emailService.SendAsync(
                user.Email,
                "LawMate Lawyer Verification Rejected",
                template);
        }

        return "Lawyer rejected successfully";
    }
}