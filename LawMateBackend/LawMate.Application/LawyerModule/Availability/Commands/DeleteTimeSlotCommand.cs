using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.Availability.Commands;

public class DeleteTimeSlotCommand : IRequest<Unit>
{
    public int SlotId { get; set; }
    public string LawyerId { get; set; } = string.Empty;
}

public class DeleteTimeSlotCommandHandler
    : IRequestHandler<DeleteTimeSlotCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public DeleteTimeSlotCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Unit> Handle(
        DeleteTimeSlotCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"DeleteTimeSlotCommand | SlotId: {request.SlotId}");

        var slot = await _context.TIMESLOT
            .FirstOrDefaultAsync(t => t.TimeSlotId == request.SlotId, cancellationToken)
            ?? throw new KeyNotFoundException($"Time slot {request.SlotId} not found.");

        if (slot.LawyerId != request.LawyerId)
            throw new UnauthorizedAccessException("You can only delete your own time slots.");

        if (slot.IsAvailable == false && slot.BookingId > 0)
            throw new ArgumentException("Cannot delete a slot that has an active booking.");

        _context.TIMESLOT.Remove(slot);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"TimeSlot deleted | Id: {request.SlotId}");

        return Unit.Value;
    }
}

