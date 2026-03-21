using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientBookings.Queries;

public record GetPaymentSlipQuery(int BookingId, string ClientId)
    : IRequest<PaymentSlipResultDto?>;

public class PaymentSlipResultDto
{
    public int     PaymentId          { get; set; }
    public string  SlipImageBase64    { get; set; } = string.Empty;
    public string  VerificationStatus { get; set; } = string.Empty;
    public DateTime CreatedAt         { get; set; }
}

public class GetPaymentSlipQueryHandler
    : IRequestHandler<GetPaymentSlipQuery, PaymentSlipResultDto?>
{
    private readonly IApplicationDbContext _context;

    public GetPaymentSlipQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentSlipResultDto?> Handle(
        GetPaymentSlipQuery request,
        CancellationToken cancellationToken)
    {
        // Verify the booking belongs to this client first
        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(
                b => b.BookingId == request.BookingId
                  && b.ClientId  == request.ClientId,
                cancellationToken);

        if (booking is null) return null;

        // Get the latest payment slip for this booking
        var payment = await _context.BOOKING_PAYMENT
            .Where(p => p.BookingId == request.BookingId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (payment is null) return null;

        return new PaymentSlipResultDto
        {
            PaymentId          = payment.Id,
            SlipImageBase64    = payment.ReceiptDocument != null
                                     ? Convert.ToBase64String(payment.ReceiptDocument)
                                     : string.Empty,
            VerificationStatus = payment.VerificationStatus == VerificationStatus.Pending
                                     ? "Pending"
                                     : payment.VerificationStatus == VerificationStatus.Verified
                                         ? "Verified"
                                         : "Rejected",
            CreatedAt          = payment.CreatedAt ?? DateTime.UtcNow,
        };
    }
}