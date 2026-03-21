using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.PaymentMaintenance.Commands;

public class UpdateBookingPaymentStatusCommand : IRequest<string>
{
    public int BookingId { get; set; } 
    public string LawyerId { get; set; }
    public string ClientId { get; set; }
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
        var bookingPayment = await _context.BOOKING_PAYMENT
            .FirstOrDefaultAsync(p => p.BookingId == request.BookingId, cancellationToken);

        if (bookingPayment == null)
            throw new Exception("Payment not found");

        bookingPayment.VerificationStatus = request.Status;
        bookingPayment.VerifiedBy = _currentUser.UserId;
        bookingPayment.VerifiedAt = DateTime.UtcNow;

        if (request.Status == VerificationStatus.Rejected)
        {
            if (string.IsNullOrEmpty(request.RejectionReason))
                throw new Exception("Rejection reason is required");

            bookingPayment.RejectionReason = request.RejectionReason;
            
            var booking = await _context.BOOKING
                .FirstOrDefaultAsync(b => b.BookingId == bookingPayment.BookingId, cancellationToken);

            if (booking == null)
                throw new Exception("Booking not found");

            booking.BookingStatus = BookingStatus.Rejected;

            // Optional (recommended)
            booking.BookingStatus = BookingStatus.Rejected;
        }
        else if (request.Status == VerificationStatus.Verified)
        {
            var booking = await _context.BOOKING
                .FirstOrDefaultAsync(b => b.BookingId == bookingPayment.BookingId, cancellationToken);

            if (booking == null)
                throw new Exception("Booking not found");

            booking.BookingStatus = BookingStatus.Verified;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return "Booking payment updated";
    }
}