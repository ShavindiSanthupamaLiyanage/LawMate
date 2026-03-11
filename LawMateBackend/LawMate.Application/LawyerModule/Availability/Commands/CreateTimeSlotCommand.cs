using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs.Booking;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.Availability.Commands;

public class CreateTimeSlotCommand : IRequest<TimeSlotResponseDto>
{
    public string LawyerId { get; set; } = string.Empty;
    public CreateTimeSlotDto Data { get; set; } = null!;
}

public class CreateTimeSlotCommandHandler
    : IRequestHandler<CreateTimeSlotCommand, TimeSlotResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public CreateTimeSlotCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TimeSlotResponseDto> Handle(
        CreateTimeSlotCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"CreateTimeSlotCommand started for LawyerId: {request.LawyerId}");

        var dto = request.Data ?? throw new ArgumentNullException(nameof(request.Data));

        // Validate time range
        if (dto.StartTime >= dto.EndTime)
            throw new ArgumentException("Start time must be before end time.");

        if (dto.StartTime < DateTime.UtcNow)
            throw new ArgumentException("Cannot create a time slot in the past.");

        // Check for overlapping slots
        var hasOverlap = await _context.TIMESLOT
            .AnyAsync(t => t.LawyerId == request.LawyerId
                           && t.StartTime < dto.EndTime
                           && t.EndTime > dto.StartTime,
                cancellationToken);

        if (hasOverlap)
            throw new ArgumentException("This time slot overlaps with an existing slot.");

        var slot = new TIMESLOT
        {
            LawyerId = request.LawyerId,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            IsAvailable = true,
            CreatedBy = request.LawyerId,
            CreatedAt = DateTime.UtcNow
        };

        _context.TIMESLOT.Add(slot);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"TimeSlot created | Id: {slot.TimeSlotId} | Lawyer: {request.LawyerId}");

        return new TimeSlotResponseDto
        {
            TimeSlotId = slot.TimeSlotId,
            LawyerId = slot.LawyerId,
            BookingId = slot.BookingId,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            IsAvailable = slot.IsAvailable,
            CreatedBy = slot.CreatedBy,
            CreatedAt = slot.CreatedAt
        };
    }
}

