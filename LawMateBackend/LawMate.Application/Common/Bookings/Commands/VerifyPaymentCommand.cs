using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs.Booking;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.Bookings.Commands;

/// <summary>
/// Verify/confirm a booking payment. Creates a BOOKING_PAYMENT record and updates booking status.
/// </summary>
public class VerifyPaymentCommand : IRequest<BookingPaymentResponseDto>
{
    public string VerifiedByUserId { get; set; } = string.Empty;
    public VerifyPaymentDto Data { get; set; } = null!;
}

public class VerifyPaymentCommandHandler
    : IRequestHandler<VerifyPaymentCommand, BookingPaymentResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public VerifyPaymentCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<BookingPaymentResponseDto> Handle(
        VerifyPaymentCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"VerifyPaymentCommand | BookingId: {request.Data.BookingId}");

        var dto = request.Data ?? throw new ArgumentNullException(nameof(request.Data));

        // Validate booking exists
        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(b => b.BookingId == dto.BookingId, cancellationToken)
            ?? throw new KeyNotFoundException($"Booking {dto.BookingId} not found.");

        // Check if payment already verified
        var existingPayment = await _context.BOOKING_PAYMENT
            .AnyAsync(p => p.BookingId == dto.BookingId
                           && p.VerificationStatus == VerificationStatus.Verified, cancellationToken);
        if (existingPayment)
            throw new ArgumentException("Payment has already been verified for this booking.");

        // Create payment record
        var payment = new BOOKING_PAYMENT
        {
            BookingId = dto.BookingId,
            TransactionId = dto.TransactionId,
            Amount = dto.Amount,
            PaymentDate = DateTime.UtcNow,
            VerificationStatus = VerificationStatus.Verified,
            VerifiedBy = request.VerifiedByUserId,
            VerifiedAt = DateTime.UtcNow,
            CreatedBy = request.VerifiedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.BOOKING_PAYMENT.Add(payment);

        // Update booking payment status and booking status
        booking.PaymentStatus = PaymentStatus.Paid;
        booking.BookingStatus = BookingStatus.Verified;
        booking.ModifiedBy = request.VerifiedByUserId;
        booking.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Payment verified | BookingId: {dto.BookingId} | PaymentId: {payment.Id}");

        return new BookingPaymentResponseDto
        {
            Id = payment.Id,
            BookingId = payment.BookingId,
            TransactionId = payment.TransactionId,
            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,
            VerificationStatus = payment.VerificationStatus,
            VerifiedBy = payment.VerifiedBy,
            VerifiedAt = payment.VerifiedAt
        };
    }
}

