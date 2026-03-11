using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.Bookings.Queries;

/// <summary>
/// Get all bookings with optional filters for admin dashboard.
/// </summary>
public class GetAllBookingsQuery : IRequest<List<BookingListResponseDto>>
{
    public BookingStatus? StatusFilter { get; set; }
    public PaymentStatus? PaymentStatusFilter { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

public class GetAllBookingsQueryHandler
    : IRequestHandler<GetAllBookingsQuery, List<BookingListResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllBookingsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BookingListResponseDto>> Handle(
        GetAllBookingsQuery request,
        CancellationToken cancellationToken)
    {
        var query = from b in _context.BOOKING
                    join clientUser in _context.USER_DETAIL on b.ClientId equals clientUser.UserId into cj
                    from client in cj.DefaultIfEmpty()
                    join lawyerUser in _context.USER_DETAIL on b.LawyerId equals lawyerUser.UserId into lj
                    from lawyer in lj.DefaultIfEmpty()
                    select new { b, client, lawyer };

        if (request.StatusFilter.HasValue)
            query = query.Where(x => x.b.BookingStatus == request.StatusFilter.Value);

        if (request.PaymentStatusFilter.HasValue)
            query = query.Where(x => x.b.PaymentStatus == request.PaymentStatusFilter.Value);

        if (request.FromDate.HasValue)
            query = query.Where(x => x.b.ScheduledDateTime >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(x => x.b.ScheduledDateTime <= request.ToDate.Value);

        return await query
            .OrderByDescending(x => x.b.ScheduledDateTime)
            .Select(x => new BookingListResponseDto
            {
                BookingId = x.b.BookingId,
                ClientId = x.b.ClientId,
                ClientName = x.client != null ? x.client.FirstName + " " + x.client.LastName : null,
                LawyerId = x.b.LawyerId,
                LawyerName = x.lawyer != null ? x.lawyer.FirstName + " " + x.lawyer.LastName : null,
                ScheduledDateTime = x.b.ScheduledDateTime,
                Duration = x.b.Duration,
                BookingStatus = x.b.BookingStatus,
                PaymentStatus = x.b.PaymentStatus,
                Amount = x.b.Amount
            })
            .ToListAsync(cancellationToken);
    }
}

/// <summary>
/// Get all payments for admin verification/review.
/// </summary>
public class GetAllPaymentsQuery : IRequest<List<BookingPaymentResponseDto>>
{
    public VerificationStatus? StatusFilter { get; set; }
}

public class GetAllPaymentsQueryHandler
    : IRequestHandler<GetAllPaymentsQuery, List<BookingPaymentResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllPaymentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BookingPaymentResponseDto>> Handle(
        GetAllPaymentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.BOOKING_PAYMENT.AsQueryable();

        if (request.StatusFilter.HasValue)
            query = query.Where(p => p.VerificationStatus == request.StatusFilter.Value);

        return await query
            .OrderByDescending(p => p.PaymentDate)
            .Select(p => new BookingPaymentResponseDto
            {
                Id = p.Id,
                BookingId = p.BookingId,
                TransactionId = p.TransactionId,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                VerificationStatus = p.VerificationStatus,
                RejectionReason = p.RejectionReason,
                VerifiedBy = p.VerifiedBy,
                VerifiedAt = p.VerifiedAt
            })
            .ToListAsync(cancellationToken);
    }
}
