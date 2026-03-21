using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.PaymentMaintenance.Commands;

public class MarkBookingPaymentAsPaidCommand : IRequest<string>
{
    public int PaymentId { get; set; }
}

public class MarkBookingPaymentAsPaidCommandHandler
    : IRequestHandler<MarkBookingPaymentAsPaidCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public MarkBookingPaymentAsPaidCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<string> Handle(
        MarkBookingPaymentAsPaidCommand request,
        CancellationToken cancellationToken)
    {
        var payment = await _context.BOOKING_PAYMENT
            .FirstOrDefaultAsync(x => x.Id == request.PaymentId, cancellationToken);

        if (payment == null)
            throw new Exception("Booking payment not found");

        if (payment.VerificationStatus != VerificationStatus.Verified)
            throw new Exception("Only verified payments can be marked as transferred");

        if (payment.IsPaid)
            throw new Exception("This payment is already marked as transferred");

        payment.IsPaid = true;
        payment.ModifiedBy = _currentUser.UserId;
        payment.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return "Booking payment marked as transferred";
    }
}