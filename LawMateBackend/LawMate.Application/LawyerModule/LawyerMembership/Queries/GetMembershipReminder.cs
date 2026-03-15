using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Entities.Lawyer;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerMembership.Queries.GetMembershipReminder;

public record GetMembershipReminder : IRequest<List<MEMBERSHIP_PAYMENT>>;

public class GetMembershipExpiringSoonQueryHandler
    : IRequestHandler<GetMembershipReminder, List<MEMBERSHIP_PAYMENT>>
{
    private readonly IApplicationDbContext _context;

    public GetMembershipExpiringSoonQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MEMBERSHIP_PAYMENT>> Handle(
        GetMembershipReminder request,
        CancellationToken cancellationToken)
    {
        var tomorrow = DateTime.Today.AddDays(1);

        return await _context.MEMBERSHIP_PAYMENT
            .Where(x => x.MembershipEndDate != null &&
                        x.MembershipEndDate.Value.Date == tomorrow &&
                        !x.IsExpired)
            .ToListAsync(cancellationToken);
    }
}