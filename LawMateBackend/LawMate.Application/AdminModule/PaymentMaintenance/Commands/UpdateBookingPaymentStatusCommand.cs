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
        
        // Devindi
        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(x => x.BookingId == payment.BookingId, cancellationToken);

        if (booking == null)
            throw new Exception("Related booking not found");

        payment.VerificationStatus = request.Status;
        payment.VerifiedBy = _currentUser.UserId;
        payment.VerifiedAt = DateTime.UtcNow;

        if (request.Status == VerificationStatus.Rejected)
            payment.RejectionReason = request.RejectionReason;
        
        // Devindi
        if (request.Status == VerificationStatus.Rejected)
        {
            booking.BookingStatus = BookingStatus.Accepted;
            booking.PaymentStatus = PaymentStatus.Failed;
        }
        else if (request.Status == VerificationStatus.Verified)
        {
            booking.BookingStatus = BookingStatus.Verified; // use Verified here if Confirmed does not exist yet
            booking.PaymentStatus = PaymentStatus.Paid;
        }

        booking.ModifiedBy = _currentUser.UserId;
        booking.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return "Booking payment updated";
    }
}