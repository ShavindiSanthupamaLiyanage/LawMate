using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs.Booking;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.Bookings.Commands;

/// <summary>
/// Process a refund for a cancelled appointment.
/// </summary>
public class RefundPaymentCommand : IRequest<BookingPaymentResponseDto>
{
    public string ProcessedByUserId { get; set; } = string.Empty;
    public RefundPaymentDto Data { get; set; } = null!;
}

public class RefundPaymentCommandHandler
    : IRequestHandler<RefundPaymentCommand, BookingPaymentResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public RefundPaymentCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<BookingPaymentResponseDto> Handle(
        RefundPaymentCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"RefundPaymentCommand | BookingId: {request.Data.BookingId}");

        var dto = request.Data ?? throw new ArgumentNullException(nameof(request.Data));

        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(b => b.BookingId == dto.BookingId, cancellationToken)
            ?? throw new KeyNotFoundException($"Booking {dto.BookingId} not found.");

        if (booking.PaymentStatus == PaymentStatus.Refunded)
            throw new ArgumentException("Payment has already been refunded for this booking.");

        if (booking.PaymentStatus != PaymentStatus.Paid)
            throw new ArgumentException("Cannot refund a booking that has not been paid.");

        // Get the original payment
        var originalPayment = await _context.BOOKING_PAYMENT
            .Where(p => p.BookingId == dto.BookingId && p.VerificationStatus == VerificationStatus.Verified)
            .FirstOrDefaultAsync(cancellationToken);

        // Create refund record
        var refundPayment = new BOOKING_PAYMENT
        {
            BookingId = dto.BookingId,
            TransactionId = $"REFUND-{originalPayment?.TransactionId ?? "N/A"}",
            Amount = -(originalPayment?.Amount ?? booking.Amount),
            PaymentDate = DateTime.UtcNow,
            VerificationStatus = VerificationStatus.Verified,
            RejectionReason = dto.Reason,
            VerifiedBy = request.ProcessedByUserId,
            VerifiedAt = DateTime.UtcNow,
            CreatedBy = request.ProcessedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.BOOKING_PAYMENT.Add(refundPayment);

        // Update booking
        booking.PaymentStatus = PaymentStatus.Refunded;
        booking.ModifiedBy = request.ProcessedByUserId;
        booking.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Payment refunded | BookingId: {dto.BookingId}");

        return new BookingPaymentResponseDto
        {
            Id = refundPayment.Id,
            BookingId = refundPayment.BookingId,
            TransactionId = refundPayment.TransactionId,
            Amount = refundPayment.Amount,
            PaymentDate = refundPayment.PaymentDate,
            VerificationStatus = refundPayment.VerificationStatus,
            RejectionReason = refundPayment.RejectionReason,
            VerifiedBy = refundPayment.VerifiedBy,
            VerifiedAt = refundPayment.VerifiedAt
        };
    }
}

