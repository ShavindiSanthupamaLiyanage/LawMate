using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.FinanceVerification.Queries;

public record GetPaidFinanceQuery() : IRequest<List<LawyerFinanceSummaryDto>>;

public class GetPaidFinanceQueryHandler 
    : IRequestHandler<GetPaidFinanceQuery, List<LawyerFinanceSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPaidFinanceQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LawyerFinanceSummaryDto>> Handle(
        GetPaidFinanceQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.BOOKING_PAYMENT
            .Where(x => x.IsPaid == true)
            .GroupBy(x => x.LawyerId)
            .Select(g => new LawyerFinanceSummaryDto
            {
                LawyerId = g.Key,
                TotalLawyerFee = g.Sum(x => x.LawyerFee)
            })
            .OrderBy(x => x.LawyerId)
            .ToListAsync(cancellationToken);
    }
}