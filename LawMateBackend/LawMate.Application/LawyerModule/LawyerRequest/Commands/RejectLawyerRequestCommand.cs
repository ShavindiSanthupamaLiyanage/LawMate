using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRequest.Commands;

public record RejectLawyerRequestCommand(
    int BookingId,
    string LawyerId,
    string Reason
) : IRequest<bool>;

public class RejectLawyerRequestCommandHandler
    : IRequestHandler<RejectLawyerRequestCommand, bool>
{
    private readonly IApplicationDbContext _db;

    public RejectLawyerRequestCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<bool> Handle(
        RejectLawyerRequestCommand request,
        CancellationToken ct)
    {
        var booking = await _db.BOOKING.FirstOrDefaultAsync(
            b => b.BookingId     == request.BookingId
                 && b.LawyerId      == request.LawyerId
                 && b.BookingStatus == BookingStatus.Pending,
            ct);

        if (booking is null) return false;

        booking.BookingStatus   = BookingStatus.Rejected;
        booking.RejectionReason = request.Reason;
        booking.ModifiedBy      = request.LawyerId;
        booking.ModifiedAt      = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}