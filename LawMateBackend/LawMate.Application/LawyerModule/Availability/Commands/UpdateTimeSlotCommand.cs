using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.Availability.Commands;

public class UpdateTimeSlotCommand : IRequest<TimeSlotResponseDto>
{
    public int SlotId { get; set; }
    public string LawyerId { get; set; } = string.Empty;
    public UpdateTimeSlotDto Data { get; set; } = null!;
}

public class UpdateTimeSlotCommandHandler
    : IRequestHandler<UpdateTimeSlotCommand, TimeSlotResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public UpdateTimeSlotCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TimeSlotResponseDto> Handle(
        UpdateTimeSlotCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"UpdateTimeSlotCommand | SlotId: {request.SlotId}");

        var slot = await _context.TIMESLOT
            .FirstOrDefaultAsync(t => t.TimeSlotId == request.SlotId, cancellationToken)
            ?? throw new KeyNotFoundException($"Time slot {request.SlotId} not found.");

        // Only the owning lawyer can edit
        if (slot.LawyerId != request.LawyerId)
            throw new UnauthorizedAccessException("You can only edit your own time slots.");

        // Cannot edit a booked slot
        if (slot.IsAvailable == false && slot.BookingId > 0)
            throw new ArgumentException("Cannot edit a slot that has already been booked.");

        var dto = request.Data;

        if (dto.StartTime.HasValue)
            slot.StartTime = dto.StartTime.Value;

        if (dto.EndTime.HasValue)
            slot.EndTime = dto.EndTime.Value;

        if (slot.StartTime >= slot.EndTime)
            throw new ArgumentException("Start time must be before end time.");

        if (dto.IsAvailable.HasValue)
            slot.IsAvailable = dto.IsAvailable.Value;

        // Check for overlapping slots (excluding current)
        var hasOverlap = await _context.TIMESLOT
            .AnyAsync(t => t.LawyerId == request.LawyerId
                           && t.TimeSlotId != request.SlotId
                           && t.StartTime < slot.EndTime
                           && t.EndTime > slot.StartTime,
                cancellationToken);

        if (hasOverlap)
            throw new ArgumentException("Updated time slot overlaps with an existing slot.");

        slot.ModifiedBy = request.LawyerId;
        slot.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"TimeSlot updated | Id: {slot.TimeSlotId}");

        return new TimeSlotResponseDto
        {
            TimeSlotId = slot.TimeSlotId,
            LawyerId = slot.LawyerId,
            BookingId = slot.BookingId,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            IsAvailable = slot.IsAvailable,
            BookedBy = slot.BookedBy,
            CreatedBy = slot.CreatedBy,
            CreatedAt = slot.CreatedAt
        };
    }
}

