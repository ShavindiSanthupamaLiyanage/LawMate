using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerBooking.Commands;

public record CancelClientBookingCommand(
    int    BookingId,
    string ClientId,
    string Reason
) : IRequest<bool>;

public class CancelClientBookingCommandHandler
    : IRequestHandler<CancelClientBookingCommand, bool>
{
    private readonly IApplicationDbContext _db;

    public CancelClientBookingCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<bool> Handle(
        CancelClientBookingCommand request,
        CancellationToken ct)
    {
        // Only the client who owns the booking can cancel it
        // Only Pending or Accepted bookings can be cancelled by the client
        var booking = await _db.BOOKING.FirstOrDefaultAsync(
            b => b.BookingId  == request.BookingId
                 && b.ClientId   == request.ClientId
                 && (b.BookingStatus == BookingStatus.Pending
                     || b.BookingStatus == BookingStatus.Accepted
                     || b.BookingStatus == BookingStatus.Confirmed),
            ct);

        if (booking is null) return false;

        booking.BookingStatus   = BookingStatus.Cancelled;
        booking.RejectionReason = request.Reason;
        booking.ModifiedBy      = request.ClientId;
        booking.ModifiedAt      = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}