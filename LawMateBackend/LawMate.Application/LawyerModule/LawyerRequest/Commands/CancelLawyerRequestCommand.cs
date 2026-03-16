using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRequest.Commands;

public record CancelLawyerRequestCommand(
    int BookingId,
    string LawyerId,
    string Reason
) : IRequest<bool>;

public class CancelLawyerRequestCommandHandler
    : IRequestHandler<CancelLawyerRequestCommand, bool>
{
    private readonly IApplicationDbContext _db;

    public CancelLawyerRequestCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<bool> Handle(
        CancelLawyerRequestCommand request,
        CancellationToken ct)
    {
        var booking = await _db.BOOKING.FirstOrDefaultAsync(
            b => b.BookingId  == request.BookingId
                 && b.LawyerId   == request.LawyerId
                 && (b.BookingStatus == BookingStatus.Confirmed
                     || b.BookingStatus == BookingStatus.Accepted),
            ct);

        if (booking is null) return false;

        booking.BookingStatus   = BookingStatus.Cancelled;
        booking.RejectionReason = request.Reason;
        booking.ModifiedBy      = request.LawyerId;
        booking.ModifiedAt      = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}