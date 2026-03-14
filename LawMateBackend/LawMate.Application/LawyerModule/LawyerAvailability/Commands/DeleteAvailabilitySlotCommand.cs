using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerAvailability.Commands;

public class DeleteAvailabilitySlotCommand : IRequest<Unit>
{
    public int TimeSlotId { get; set; }
}

public class DeleteAvailabilitySlotCommandHandler
    : IRequestHandler<DeleteAvailabilitySlotCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public DeleteAvailabilitySlotCommandHandler(
        IApplicationDbContext context,
        IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Unit> Handle(
        DeleteAvailabilitySlotCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"DeleteAvailabilitySlotCommand started for TimeSlotId: {request.TimeSlotId}");

        var timeSlot = await _context.TIMESLOT
            .FirstOrDefaultAsync(ts => ts.TimeSlotId == request.TimeSlotId, cancellationToken);

        if (timeSlot == null)
        {
            _logger.Warning($"Slot deletion failed | TimeSlot not found: {request.TimeSlotId}");
            throw new KeyNotFoundException($"TimeSlot with ID {request.TimeSlotId} not found");
        }

        // Check if slot is booked
        if (timeSlot.BookingId != null && timeSlot.BookingId > 0)
        {
            _logger.Warning($"Slot deletion failed | Cannot delete booked slot: {request.TimeSlotId}");
            throw new InvalidOperationException("Cannot delete a booked time slot. Please cancel the booking first.");
        }

        _context.TIMESLOT.Remove(timeSlot);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Availability slot deleted | TimeSlotId: {request.TimeSlotId}");

        return Unit.Value;
    }
}
