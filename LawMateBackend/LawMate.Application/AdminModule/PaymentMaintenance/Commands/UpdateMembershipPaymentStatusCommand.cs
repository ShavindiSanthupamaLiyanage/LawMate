using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.PaymentMaintenance.Commands;

public class UpdateMembershipPaymentStatusCommand : IRequest<bool>
{
    public string LawyerId { get; set; }
    public VerificationStatus Status { get; set; }
    public string? RejectionReason { get; set; }
}

public class UpdateMembershipPaymentStatusCommandHandler
    : IRequestHandler<UpdateMembershipPaymentStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;

    public UpdateMembershipPaymentStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IEmailService emailService,
        IEmailTemplateService templateService)
    {
        _context = context;
        _currentUser = currentUser;
        _emailService = emailService;
        _templateService = templateService;
    }

    public async Task<bool> Handle(UpdateMembershipPaymentStatusCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.MEMBERSHIP_PAYMENT
            .Where(p => p.LawyerId == request.LawyerId)
            .OrderByDescending(p => p.PaymentDate)
            .FirstOrDefaultAsync(cancellationToken);
        
        if (payment == null)
            throw new Exception("Payment not found");

        payment.VerificationStatus = request.Status;
        payment.VerifiedBy = _currentUser.UserId;
        payment.VerifiedAt = DateTime.UtcNow;

        var user = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.UserId == request.LawyerId);

        if (request.Status == VerificationStatus.Verified)
        {
            user.State = State.AllVerified; 
        }
        else if (request.Status == VerificationStatus.Rejected)
        {
            if (string.IsNullOrEmpty(request.RejectionReason))
                throw new Exception("Rejection reason is required");

            payment.RejectionReason = request.RejectionReason;

            user.State = State.Pending; 
        }

        await _context.SaveChangesAsync(cancellationToken);

        var email = user.Email;
        var name = $"{user.FirstName} {user.LastName}";

        string template;
        string subject;

        if (request.Status == VerificationStatus.Verified)
        {
            template = _templateService.LoadTemplate("MembershipApproved.html");
            subject = "Membership Payment Approved";
        }
        else
        {
            template = _templateService.LoadTemplate("MembershipRejected.html");
            subject = "Membership Payment Rejected";
        }

        template = template
            .Replace("{{Name}}", name)
            .Replace("{{Reason}}", request.RejectionReason ?? "")
            .Replace("{{LogoUrl}}", "https://yourdomain.com/logo.png");

        await _emailService.SendAsync(email, subject, template);

        return true;
    }
}