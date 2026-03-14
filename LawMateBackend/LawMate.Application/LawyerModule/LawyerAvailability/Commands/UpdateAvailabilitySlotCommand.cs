using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerAvailability.Commands;

public class UpdateAvailabilitySlotCommand : IRequest<Unit>
{
    public int TimeSlotId { get; set; }
    public UpdateAvailabilitySlotDto Data { get; set; }
}

public class UpdateAvailabilitySlotCommandHandler
    : IRequestHandler<UpdateAvailabilitySlotCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAppLogger _logger;

    public UpdateAvailabilitySlotCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAppLogger logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Unit> Handle(
        UpdateAvailabilitySlotCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"UpdateAvailabilitySlotCommand started for TimeSlotId: {request.TimeSlotId}");

        var dto = request.Data
            ?? throw new ArgumentNullException(nameof(request.Data));

        var timeSlot = await _context.TIMESLOT
            .FirstOrDefaultAsync(ts => ts.TimeSlotId == request.TimeSlotId, cancellationToken);

        if (timeSlot == null)
        {
            _logger.Warning($"Slot update failed | TimeSlot not found: {request.TimeSlotId}");
            throw new KeyNotFoundException($"TimeSlot with ID {request.TimeSlotId} not found");
        }

        // Check if slot is booked
        if (timeSlot.BookingId != null && timeSlot.BookingId > 0)
        {
            // If date/time is being changed, disallow
            if (dto.Date.HasValue || dto.StartTime != null)
            {
                _logger.Warning($"Slot update failed | Cannot modify booked slot date/time: {request.TimeSlotId}");
                throw new InvalidOperationException("Cannot modify date or time of a booked slot");
            }
        }

        var currentUser = _currentUserService.UserId ?? "SYSTEM";

        // Update date and time if provided
        if (dto.Date.HasValue || dto.StartTime != null)
        {
            var newDate = dto.Date ?? timeSlot.StartTime.Date;
            TimeSpan newTime;

            if (dto.StartTime != null)
            {
                if (!TimeSpan.TryParse(dto.StartTime, out newTime))
                {
                    throw new ArgumentException($"Invalid time format: {dto.StartTime}. Expected HH:mm format.");
                }
            }
            else
            {
                newTime = timeSlot.StartTime.TimeOfDay;
            }

            var newStartDateTime = newDate.Add(newTime);
            var duration = dto.Duration ?? (int)(timeSlot.EndTime - timeSlot.StartTime).TotalMinutes;
            var newEndDateTime = newStartDateTime.AddMinutes(duration);

            // Check for overlapping slots (excluding current slot)
            var hasOverlap = await _context.TIMESLOT
                .AnyAsync(ts =>
                    ts.LawyerId == timeSlot.LawyerId &&
                    ts.TimeSlotId != timeSlot.TimeSlotId &&
                    ((newStartDateTime >= ts.StartTime && newStartDateTime < ts.EndTime) ||
                     (newEndDateTime > ts.StartTime && newEndDateTime <= ts.EndTime) ||
                     (newStartDateTime <= ts.StartTime && newEndDateTime >= ts.EndTime)),
                    cancellationToken);

            if (hasOverlap)
            {
                _logger.Warning($"Slot update failed | Overlapping time slot for TimeSlotId: {request.TimeSlotId}");
                throw new InvalidOperationException("This time slot overlaps with an existing slot");
            }

            timeSlot.StartTime = newStartDateTime;
            timeSlot.EndTime = newEndDateTime;
        }
        else if (dto.Duration.HasValue)
        {
            // Only duration is being updated
            timeSlot.EndTime = timeSlot.StartTime.AddMinutes(dto.Duration.Value);
        }

        // Update price if provided (Note: TIMESLOT entity doesn't have Price field currently)
        // TODO: Add Price field to TIMESLOT entity if needed

        timeSlot.ModifiedBy = currentUser;
        timeSlot.ModifiedAt = DateTime.Now;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Availability slot updated | TimeSlotId: {request.TimeSlotId}");

        return Unit.Value;
    }
}
