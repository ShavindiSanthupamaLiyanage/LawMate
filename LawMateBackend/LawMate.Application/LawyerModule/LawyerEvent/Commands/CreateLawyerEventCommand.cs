using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerEvent.Commands;

public class CreateLawyerEventCommand : IRequest<int>
{
    public CreateLawyerEventDto Data { get; set; }
}

public class CreateLawyerEventCommandHandler
    : IRequestHandler<CreateLawyerEventCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAppLogger _logger;

    public CreateLawyerEventCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAppLogger logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<int> Handle(
        CreateLawyerEventCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info("CreateLawyerEventCommand started");

        var dto = request.Data
            ?? throw new ArgumentNullException(nameof(request.Data));

        var lawyerUserId = dto.LawyerId?.Trim();
        if (string.IsNullOrWhiteSpace(lawyerUserId))
        {
            throw new ArgumentException("LawyerId is required.");
        }

        var lawyerExists = await _context.USER_DETAIL
            .AnyAsync(u => u.UserId == lawyerUserId && u.UserRole == UserRole.Lawyer, cancellationToken);

        if (!lawyerExists)
        {
            _logger.Warning($"Lawyer event creation failed | Lawyer not found: {lawyerUserId}");
            throw new KeyNotFoundException($"Lawyer with ID {lawyerUserId} not found");
        }

        var mode = dto.Mode?.Trim();
        if (string.IsNullOrWhiteSpace(mode))
        {
            throw new ArgumentException("Mode is required.");
        }

        if (!mode.Equals("Physical", StringComparison.OrdinalIgnoreCase)
            && !mode.Equals("Virtual", StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Mode must be either Physical or Virtual.");
        }

        if (dto.Duration < 15 || dto.Duration > 720)
        {
            throw new ArgumentException("Duration must be between 15 and 720 minutes.");
        }

        var startDateTime = dto.DateTime;
        var endDateTime = startDateTime.AddMinutes(dto.Duration);

        var overlapsAppointment = await _context.BOOKING
            .AnyAsync(b => b.LawyerId == lawyerUserId
                           && startDateTime < b.ScheduledDateTime.AddMinutes(b.Duration)
                           && endDateTime > b.ScheduledDateTime,
                cancellationToken);

        if (overlapsAppointment)
        {
            throw new InvalidOperationException("This event overlaps with an existing appointment.");
        }

        var overlapsEvent = await _context.LAWYER_EVENT
            .AnyAsync(e => e.LawyerId == lawyerUserId
                           && startDateTime < e.EventDateTime.AddMinutes(e.Duration)
                           && endDateTime > e.EventDateTime,
                cancellationToken);

        if (overlapsEvent)
        {
            throw new InvalidOperationException("This event overlaps with another event.");
        }

        var currentUser = _currentUserService.UserId ?? "SYSTEM";

        var lawyerEvent = new LAWYER_EVENT
        {
            LawyerId = lawyerUserId,
            Title = dto.Title.Trim(),
            EventType = string.IsNullOrWhiteSpace(dto.EventType) ? "Other Event" : dto.EventType.Trim(),
            EventDateTime = startDateTime,
            Duration = dto.Duration,
            Mode = mode,
            Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim(),
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
            CreatedBy = currentUser,
            CreatedAt = DateTime.Now
        };

        _context.LAWYER_EVENT.Add(lawyerEvent);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Lawyer event created | EventId: {lawyerEvent.EventId}, LawyerId: {lawyerUserId}");

        return lawyerEvent.EventId;
    }
}
