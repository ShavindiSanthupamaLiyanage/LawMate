using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRequest.Commands;

public record AcceptLawyerRequestCommand(
    int BookingId,
    string LawyerId
) : IRequest<bool>;

public class AcceptLawyerRequestCommandHandler
    : IRequestHandler<AcceptLawyerRequestCommand, bool>
{
    private readonly IApplicationDbContext _db;

    public AcceptLawyerRequestCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<bool> Handle(
        AcceptLawyerRequestCommand request,
        CancellationToken ct)
    {
        var booking = await _db.BOOKING.FirstOrDefaultAsync(
            b => b.BookingId     == request.BookingId
                 && b.LawyerId      == request.LawyerId
                 && b.BookingStatus == BookingStatus.Pending,
            ct);

        if (booking is null) return false;

        booking.BookingStatus = BookingStatus.Accepted;
        booking.ModifiedBy    = request.LawyerId;
        booking.ModifiedAt    = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}