using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.Appointments.Commands;

/// <summary>
/// Cancel an appointment. Releases the time slot back to available.
/// </summary>
public class CancelAppointmentCommand : IRequest<Unit>
{
    public int BookingId { get; set; }
    public string UserId { get; set; } = string.Empty;
}

public class CancelAppointmentCommandHandler
    : IRequestHandler<CancelAppointmentCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public CancelAppointmentCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Unit> Handle(
        CancelAppointmentCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"CancelAppointmentCommand | BookingId: {request.BookingId}");

        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(b => b.BookingId == request.BookingId, cancellationToken)
            ?? throw new KeyNotFoundException($"Booking {request.BookingId} not found.");

        // Only the lawyer or client involved can cancel
        if (booking.LawyerId != request.UserId && booking.ClientId != request.UserId)
            throw new UnauthorizedAccessException("You are not authorized to cancel this booking.");

        if (booking.BookingStatus == BookingStatus.Suspended)
            throw new ArgumentException("This booking is already cancelled.");

        // Update booking status
        booking.BookingStatus = BookingStatus.Suspended;
        booking.ModifiedBy = request.UserId;
        booking.ModifiedAt = DateTime.UtcNow;

        // Release the time slot
        var slot = await _context.TIMESLOT
            .FirstOrDefaultAsync(t => t.TimeSlotId == booking.TimeSlotId, cancellationToken);
        if (slot != null)
        {
            slot.IsAvailable = true;
            slot.BookedBy = null;
            slot.BookingId = 0;
            slot.ModifiedBy = request.UserId;
            slot.ModifiedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Appointment cancelled | BookingId: {request.BookingId}");

        return Unit.Value;
    }
}

