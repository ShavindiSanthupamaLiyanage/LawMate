using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Booking;
using LawMate.Domain.Common.Enums;
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

        var lawyerUserId = dto.LawyerId?.Trim();
        if (string.IsNullOrWhiteSpace(lawyerUserId))
        {
            throw new ArgumentException("LawyerId is required.");
        }

        // Validate lawyer by public UserId (e.g., LAW002), not internal numeric Id.
        var lawyerExists = await _context.USER_DETAIL
            .AnyAsync(u => u.UserId == lawyerUserId && u.UserRole == UserRole.Lawyer, cancellationToken);

        if (!lawyerExists)
        {
            _logger.Warning($"Availability slot creation failed | Lawyer not found: {lawyerUserId}");
            throw new KeyNotFoundException($"Lawyer with ID {lawyerUserId} not found");
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
                ts.LawyerId == lawyerUserId &&
                ((startDateTime >= ts.StartTime && startDateTime < ts.EndTime) ||
                 (endDateTime > ts.StartTime && endDateTime <= ts.EndTime) ||
                 (startDateTime <= ts.StartTime && endDateTime >= ts.EndTime)),
                cancellationToken);

        if (hasOverlap)
        {
            _logger.Warning($"Availability slot creation failed | Overlapping time slot for LawyerId: {lawyerUserId}");
            throw new InvalidOperationException("This time slot overlaps with an existing slot");
        }

        var currentUser = _currentUserService.UserId ?? "SYSTEM";

        var timeSlot = new TIMESLOT
        {
            LawyerId = lawyerUserId,
            StartTime = startDateTime,
            EndTime = endDateTime,
            IsAvailable = true,
            CreatedBy = currentUser,
            CreatedAt = DateTime.Now
        };

        _context.TIMESLOT.Add(timeSlot);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Availability slot created | TimeSlotId: {timeSlot.TimeSlotId}, LawyerId: {lawyerUserId}");

        return timeSlot.TimeSlotId;
    }
}
