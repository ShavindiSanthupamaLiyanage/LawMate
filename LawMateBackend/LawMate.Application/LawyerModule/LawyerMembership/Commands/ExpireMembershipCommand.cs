using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.MembershipModule.Commands.ExpireMembership;

public record ExpireMembershipCommand : IRequest;

public class ExpireMembershipCommandHandler
    : IRequestHandler<ExpireMembershipCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;

    public ExpireMembershipCommandHandler(
        IApplicationDbContext context,
        IEmailService emailService,
        IEmailTemplateService templateService)
    {
        _context = context;
        _emailService = emailService;
        _templateService = templateService;
    }

    public async Task Handle(
        ExpireMembershipCommand request,
        CancellationToken cancellationToken)
    {
        var today = DateTime.Today;

        var expiredPayments = await _context.MEMBERSHIP_PAYMENT
            .Where(x => x.MembershipEndDate != null &&
                        x.MembershipEndDate.Value.Date < today &&
                        !x.IsExpired)
            .ToListAsync(cancellationToken);

        foreach (var payment in expiredPayments)
        {
            payment.IsExpired = true;

            var user = await _context.USER_DETAIL
                .FirstOrDefaultAsync(x => x.UserId == payment.LawyerId,
                    cancellationToken);

            if (user == null) continue;

            user.State = 0; // pending lawyers

            var template = _templateService.LoadTemplate("MembershipExpired.html");

            template = template
                .Replace("{{FullName}}", $"{user.FirstName} {user.LastName}")
                .Replace("{{EndDate}}", payment.MembershipEndDate.Value.ToString("yyyy-MM-dd"))
                .Replace("{{LogoUrl}}", "https://yourlogo.com/logo.png");

            await _emailService.SendAsync(
                user.Email,
                "LawMate Membership Expired",
                template);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}