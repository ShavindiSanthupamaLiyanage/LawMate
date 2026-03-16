using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerFinance.Queries;

public record GetLawyerFinanceTransactionsQuery(
    string LawyerId,
    string? Search = null,
    VerificationStatus? Status = null)
    : IRequest<List<LawyerFinanceTransactionItemDto>>;

public class GetLawyerFinanceTransactionsQueryHandler
    : IRequestHandler<GetLawyerFinanceTransactionsQuery, List<LawyerFinanceTransactionItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerFinanceTransactionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LawyerFinanceTransactionItemDto>> Handle(
        GetLawyerFinanceTransactionsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.BOOKING_PAYMENT
            .Where(x => x.LawyerId == request.LawyerId);

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.VerificationStatus == request.Status.Value);
        }

        var payments = await query
            .Join(
                _context.BOOKING,
                payment => payment.BookingId,
                booking => booking.BookingId,
                (payment, booking) => new { payment, booking }
            )
            .GroupJoin(
                _context.USER_DETAIL,
                pb => pb.booking.ClientId,
                user => user.UserId,
                (pb, users) => new { pb.payment, pb.booking, users }
            )
            .SelectMany(
                x => x.users.DefaultIfEmpty(),
                (x, user) => new LawyerFinanceTransactionItemDto
                {
                    PaymentId = x.payment.Id,
                    BookingId = x.booking.BookingId,
                    ReferenceNo = "APT-" + x.booking.BookingId.ToString("D4"),
                    ClientDisplay = user == null
                        ? x.booking.ClientId
                        : (((user.FirstName ?? "") + " " + (user.LastName ?? "")).Trim() == ""
                            ? x.booking.ClientId
                            : ((user.FirstName ?? "") + " " + (user.LastName ?? "")).Trim()),
                    Amount = x.payment.LawyerFee,
                    TransactionDate = x.payment.VerifiedAt ?? x.payment.PaymentDate,
                    Status = x.payment.VerificationStatus == VerificationStatus.Verified
                        ? "Verified Payment"
                        : x.payment.VerificationStatus == VerificationStatus.Pending
                            ? "Pending Verification"
                            : "Rejected Payment"
                })
            .ToListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();

            payments = payments
                .Where(x =>
                    x.ReferenceNo.ToLower().Contains(search) ||
                    x.ClientDisplay.ToLower().Contains(search))
                .ToList();
        }

        return payments
            .OrderByDescending(x => x.TransactionDate)
            .ToList();
    }
}