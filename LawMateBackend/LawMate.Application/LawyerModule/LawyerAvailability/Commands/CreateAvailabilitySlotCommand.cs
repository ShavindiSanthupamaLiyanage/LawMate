using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerAvailability.Commands;

public class CreateAvailabilitySlotCommand : IRequest<int>
{
    public CreateAvailabilitySlotDto Data { get; set; }
}

public class CreateAvailabilitySlotCommandHandler
    : IRequestHandler<CreateAvailabilitySlotCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAppLogger _logger;

    public CreateAvailabilitySlotCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAppLogger logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<int> Handle(
        CreateAvailabilitySlotCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info("CreateAvailabilitySlotCommand started");

        var dto = request.Data
            ?? throw new ArgumentNullException(nameof(request.Data));

        // Validate lawyer exists
        var lawyerExists = await _context.LAWYER_DETAILS
            .AnyAsync(l => l.UserId == dto.LawyerId, cancellationToken);

        if (!lawyerExists)
        {
            _logger.Warning($"Availability slot creation failed | Lawyer not found: {dto.LawyerId}");
            throw new KeyNotFoundException($"Lawyer with ID {dto.LawyerId} not found");
        }

        // Parse the time string and combine with date
        if (!TimeSpan.TryParse(dto.StartTime, out var timeOfDay))
        {
            throw new ArgumentException($"Invalid time format: {dto.StartTime}. Expected HH:mm format.");
        }

        var startDateTime = dto.Date.Date.Add(timeOfDay);
        var endDateTime = startDateTime.AddMinutes(dto.Duration);

        // Check for overlapping slots
        var hasOverlap = await _context.TIMESLOT
            .AnyAsync(ts =>
                ts.LawyerId == dto.LawyerId &&
                ((startDateTime >= ts.StartTime && startDateTime < ts.EndTime) ||
                 (endDateTime > ts.StartTime && endDateTime <= ts.EndTime) ||
                 (startDateTime <= ts.StartTime && endDateTime >= ts.EndTime)),
                cancellationToken);

        if (hasOverlap)
        {
            _logger.Warning($"Availability slot creation failed | Overlapping time slot for LawyerId: {dto.LawyerId}");
            throw new InvalidOperationException("This time slot overlaps with an existing slot");
        }

        var currentUser = _currentUserService.UserId ?? "SYSTEM";

        var timeSlot = new TIMESLOT
        {
            LawyerId = dto.LawyerId,
            StartTime = startDateTime,
            EndTime = endDateTime,
            IsAvailable = true,
            CreatedBy = currentUser,
            CreatedAt = DateTime.Now
        };

        _context.TIMESLOT.Add(timeSlot);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Availability slot created | TimeSlotId: {timeSlot.TimeSlotId}, LawyerId: {dto.LawyerId}");

        return timeSlot.TimeSlotId;
    }
}
