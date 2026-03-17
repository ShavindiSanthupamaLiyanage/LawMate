using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.PaymentMaintenance.Commands;

public class UpdateBookingPaymentStatusCommand : IRequest<string>
{
    public int PaymentId { get; set; }
    public VerificationStatus Status { get; set; }
    public string? RejectionReason { get; set; }
}

public class UpdateBookingPaymentStatusCommandHandler
    : IRequestHandler<UpdateBookingPaymentStatusCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateBookingPaymentStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<string> Handle(UpdateBookingPaymentStatusCommand request, CancellationToken cancellationToken)
    {
        var payment = await _context.BOOKING_PAYMENT
            .FirstOrDefaultAsync(x => x.Id == request.PaymentId, cancellationToken);

        if (payment == null)
            throw new Exception("Booking payment not found");

        payment.VerificationStatus = request.Status;
        payment.VerifiedBy = _currentUser.UserId;
        payment.VerifiedAt = DateTime.Now;

        if (request.Status == VerificationStatus.Rejected)
            payment.RejectionReason = request.RejectionReason;

        await _context.SaveChangesAsync(cancellationToken);

        return "Booking payment updated";
    }
}