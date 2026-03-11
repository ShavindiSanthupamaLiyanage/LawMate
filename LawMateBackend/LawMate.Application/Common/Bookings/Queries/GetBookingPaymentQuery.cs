using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.Bookings.Queries;

/// <summary>
/// Get payment status for a specific booking.
/// </summary>
public record GetBookingPaymentQuery(int BookingId) : IRequest<BookingPaymentResponseDto?>;

public class GetBookingPaymentQueryHandler
    : IRequestHandler<GetBookingPaymentQuery, BookingPaymentResponseDto?>
{
    private readonly IApplicationDbContext _context;

    public GetBookingPaymentQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BookingPaymentResponseDto?> Handle(
        GetBookingPaymentQuery request,
        CancellationToken cancellationToken)
    {
        var payment = await _context.BOOKING_PAYMENT
            .Where(p => p.BookingId == request.BookingId)
            .OrderByDescending(p => p.PaymentDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (payment == null)
            return null;

        return new BookingPaymentResponseDto
        {
            Id = payment.Id,
            BookingId = payment.BookingId,
            TransactionId = payment.TransactionId,
            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,
            VerificationStatus = payment.VerificationStatus,
            RejectionReason = payment.RejectionReason,
            VerifiedBy = payment.VerifiedBy,
            VerifiedAt = payment.VerifiedAt
        };
    }
}

