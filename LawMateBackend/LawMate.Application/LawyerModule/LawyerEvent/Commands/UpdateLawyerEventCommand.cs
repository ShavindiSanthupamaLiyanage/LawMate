using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerEvent.Commands;

public class UpdateLawyerEventCommand : IRequest<bool>
{
    public int EventId { get; set; }
    public UpdateLawyerEventDto Data { get; set; }
}

public class UpdateLawyerEventCommandHandler
    : IRequestHandler<UpdateLawyerEventCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAppLogger _logger;

    public UpdateLawyerEventCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAppLogger logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<bool> Handle(
        UpdateLawyerEventCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"UpdateLawyerEventCommand started for EventId: {request.EventId}");

        var dto = request.Data
            ?? throw new ArgumentNullException(nameof(request.Data));

        var lawyerEvent = await _context.LAWYER_EVENT
            .FirstOrDefaultAsync(e => e.EventId == request.EventId, cancellationToken);

        if (lawyerEvent == null)
        {
            _logger.Warning($"Lawyer event not found: {request.EventId}");
            throw new KeyNotFoundException($"Lawyer event with ID {request.EventId} not found");
        }

        var mode = dto.Mode?.Trim();
        if (!string.IsNullOrWhiteSpace(mode))
        {
            if (!mode.Equals("Physical", StringComparison.OrdinalIgnoreCase)
                && !mode.Equals("Virtual", StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException("Mode must be either Physical or Virtual.");
            }
        }

        if (dto.Duration.HasValue && (dto.Duration < 15 || dto.Duration > 720))
        {
            throw new ArgumentException("Duration must be between 15 and 720 minutes.");
        }

        var startDateTime = dto.DateTime ?? lawyerEvent.EventDateTime;
        var duration = dto.Duration ?? lawyerEvent.Duration;
        var endDateTime = startDateTime.AddMinutes(duration);

        // Check for overlaps with other events (excluding current event)
        var overlapsEvent = await _context.LAWYER_EVENT
            .AnyAsync(e => e.EventId != request.EventId
                           && e.LawyerId == lawyerEvent.LawyerId
                           && startDateTime < e.EventDateTime.AddMinutes(e.Duration)
                           && endDateTime > e.EventDateTime,
                cancellationToken);

        if (overlapsEvent)
        {
            throw new InvalidOperationException("This event overlaps with another event.");
        }

        // Check for overlaps with bookings
        var overlapsAppointment = await _context.BOOKING
            .AnyAsync(b => b.LawyerId == lawyerEvent.LawyerId
                           && startDateTime < b.ScheduledDateTime.AddMinutes(b.Duration)
                           && endDateTime > b.ScheduledDateTime,
                cancellationToken);

        if (overlapsAppointment)
        {
            throw new InvalidOperationException("This event overlaps with an existing appointment.");
        }

        var currentUser = _currentUserService.UserId ?? "SYSTEM";

        // Update fields
        if (!string.IsNullOrWhiteSpace(dto.Title))
            lawyerEvent.Title = dto.Title.Trim();

        if (!string.IsNullOrWhiteSpace(dto.EventType))
            lawyerEvent.EventType = dto.EventType.Trim();

        if (dto.DateTime.HasValue)
            lawyerEvent.EventDateTime = startDateTime;

        if (dto.Duration.HasValue)
            lawyerEvent.Duration = duration;

        if (!string.IsNullOrWhiteSpace(mode))
            lawyerEvent.Mode = mode;

        lawyerEvent.Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim();
        lawyerEvent.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
        lawyerEvent.ModifiedBy = currentUser;
        lawyerEvent.ModifiedAt = DateTime.Now;

        _context.LAWYER_EVENT.Update(lawyerEvent);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Lawyer event updated | EventId: {lawyerEvent.EventId}");

        return true;
    }
}
