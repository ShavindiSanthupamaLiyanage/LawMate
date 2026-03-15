using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerFinance.Queries;

public record GetLawyerFinanceDashboardQuery(string LawyerId) : IRequest<LawyerFinanceDashboardDto>;

public class GetLawyerFinanceDashboardQueryHandler
    : IRequestHandler<GetLawyerFinanceDashboardQuery, LawyerFinanceDashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerFinanceDashboardQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LawyerFinanceDashboardDto> Handle(
        GetLawyerFinanceDashboardQuery request,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1);

        var payments = await _context.BOOKING_PAYMENT
            .Where(x => x.LawyerId == request.LawyerId)
            .ToListAsync(cancellationToken);

        var recentTransactions = await _context.BOOKING_PAYMENT
            .Where(x => x.LawyerId == request.LawyerId)
            .Join(
                _context.BOOKING,
                payment => payment.BookingId,
                booking => booking.BookingId,
                (payment, booking) => new LawyerFinanceTransactionItemDto
                {
                    PaymentId = payment.Id,
                    BookingId = booking.BookingId,
                    ReferenceNo = "APT-" + booking.BookingId.ToString("D4"),
                    ClientDisplay = booking.ClientId,
                    Amount = payment.LawyerFee,
                    TransactionDate = payment.VerifiedAt ?? payment.PaymentDate,
                    Status = payment.VerificationStatus == VerificationStatus.Verified
                        ? "Verified Payment"
                        : payment.VerificationStatus == VerificationStatus.Pending
                            ? "Pending Verification"
                            : "Rejected Payment"
                })
            .OrderByDescending(x => x.TransactionDate)
            .Take(5)
            .ToListAsync(cancellationToken);

        return new LawyerFinanceDashboardDto
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
                .Sum(x => (decimal)x.LawyerFee),

            RecentTransactions = recentTransactions
        };
    }
}