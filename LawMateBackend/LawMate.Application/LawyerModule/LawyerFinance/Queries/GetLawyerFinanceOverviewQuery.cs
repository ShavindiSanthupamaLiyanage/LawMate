using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerFinance.Queries;

public record GetLawyerFinanceOverviewQuery(string LawyerId) : IRequest<LawyerFinanceOverviewDto>;

public class GetLawyerFinanceOverviewQueryHandler
    : IRequestHandler<GetLawyerFinanceOverviewQuery, LawyerFinanceOverviewDto>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerFinanceOverviewQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LawyerFinanceOverviewDto> Handle(
        GetLawyerFinanceOverviewQuery request,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);

        var payments = await _context.BOOKING_PAYMENT
            .Where(x => x.LawyerId == request.LawyerId)
            .ToListAsync(cancellationToken);

        return new LawyerFinanceOverviewDto
        {
            TotalEarnings = payments
                .Where(x => x.VerificationStatus == VerificationStatus.Verified)
                .Sum(x => (decimal)x.LawyerFee),

            ThisMonth = payments
                .Where(x => x.VerificationStatus == VerificationStatus.Verified
                            && x.VerifiedAt != null
                            && x.VerifiedAt >= monthStart)
                .Sum(x => (decimal)x.LawyerFee),

            PendingVerification = payments
                .Where(x => x.VerificationStatus == VerificationStatus.Pending)
                .Sum(x => (decimal)x.LawyerFee),

            TransferredToBank = payments
                .Where(x => x.IsPaid)
                .Sum(x => (decimal)x.LawyerFee)
        };
    }
}