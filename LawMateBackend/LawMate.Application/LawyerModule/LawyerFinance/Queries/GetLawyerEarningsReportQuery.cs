using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerFinance.Queries;

public record GetLawyerEarningsReportQuery(
    string LawyerId,
    DateTime? StartDate = null,
    DateTime? EndDate = null)
    : IRequest<LawyerEarningsReportDto>;

public class GetLawyerEarningsReportQueryHandler
    : IRequestHandler<GetLawyerEarningsReportQuery, LawyerEarningsReportDto>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerEarningsReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LawyerEarningsReportDto> Handle(
        GetLawyerEarningsReportQuery request,
        CancellationToken cancellationToken)
    {
        var paymentsQuery = _context.BOOKING_PAYMENT
            .Where(x => x.LawyerId == request.LawyerId);

        if (request.StartDate.HasValue)
            paymentsQuery = paymentsQuery.Where(x => x.PaymentDate >= request.StartDate.Value);

        if (request.EndDate.HasValue)
        {
            var inclusiveEnd = request.EndDate.Value.Date.AddDays(1).AddTicks(-1);
            paymentsQuery = paymentsQuery.Where(x => x.PaymentDate <= inclusiveEnd);
        }

        var payments = await paymentsQuery.ToListAsync(cancellationToken);

        var bookingClientMap = await _context.BOOKING
            .Where(x => x.LawyerId == request.LawyerId)
            .Select(x => new { x.BookingId, x.ClientId })
            .ToDictionaryAsync(x => x.BookingId, x => x.ClientId, cancellationToken);

        var topClients = payments
            .Where(x => x.VerificationStatus == VerificationStatus.Verified)
            .GroupBy(x => bookingClientMap.ContainsKey(x.BookingId) ? bookingClientMap[x.BookingId] : "Unknown")
            .Select(g => new LawyerTopClientIncomeDto
            {
                ClientId = g.Key,
                Amount = g.Sum(x => (decimal)x.LawyerFee)
            })
            .OrderByDescending(x => x.Amount)
            .Take(5)
            .ToList();

        return new LawyerEarningsReportDto
        {
            TotalSessions = payments.Count,
            TotalEarnings = payments
                .Where(x => x.VerificationStatus == VerificationStatus.Verified)
                .Sum(x => (decimal)x.LawyerFee),

            VerifiedAmount = payments
                .Where(x => x.VerificationStatus == VerificationStatus.Verified)
                .Sum(x => (decimal)x.LawyerFee),

            PendingAmount = payments
                .Where(x => x.VerificationStatus == VerificationStatus.Pending)
                .Sum(x => (decimal)x.LawyerFee),

            TransferredAmount = payments
                .Where(x => x.IsPaid)
                .Sum(x => (decimal)x.LawyerFee),

            TopClients = topClients
        };
    }
}