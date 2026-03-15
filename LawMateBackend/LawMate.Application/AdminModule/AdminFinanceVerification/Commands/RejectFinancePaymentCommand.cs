using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.FinanceVerification.Commands;

public record RejectFinancePaymentCommand(
    int BookingId,
    string RejectionReason,
    string VerifiedBy
) : IRequest<string>;

public class RejectFinancePaymentCommandHandler 
    : IRequestHandler<RejectFinancePaymentCommand, string>
{
    private readonly IApplicationDbContext _context;

    public RejectFinancePaymentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> Handle(
        RejectFinancePaymentCommand request,
        CancellationToken cancellationToken)
    {
        var payment = await _context.BOOKING_PAYMENT
            .FirstOrDefaultAsync(x => x.BookingId == request.BookingId, cancellationToken);

        if (payment == null)
            throw new Exception("Payment not found");

        payment.VerificationStatus = VerificationStatus.Rejected;
        payment.RejectionReason = request.RejectionReason;
        payment.VerifiedBy = request.VerifiedBy;
        payment.VerifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return "Payment rejected successfully";
    }
}