using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.FinanceVerification.Queries;

public record GetAllFinanceQuery() : IRequest<List<LawyerFinanceSummaryDto>>;

public class GetAllFinanceQueryHandler 
    : IRequestHandler<GetAllFinanceQuery, List<LawyerFinanceSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllFinanceQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LawyerFinanceSummaryDto>> Handle(
        GetAllFinanceQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.BOOKING_PAYMENT
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