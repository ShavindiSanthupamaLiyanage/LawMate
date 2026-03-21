using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerAvailability.Queries;

// ─── Get All Slots Query ──────────────────────────────────────────────────────

public record GetLawyerAvailabilitySlotsQuery(
    string LawyerId,
    DateTime? StartDate = null,
    DateTime? EndDate   = null
) : IRequest<List<GetAvailabilitySlotDto>>;

public class GetLawyerAvailabilitySlotsQueryHandler
    : IRequestHandler<GetLawyerAvailabilitySlotsQuery, List<GetAvailabilitySlotDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerAvailabilitySlotsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetAvailabilitySlotDto>> Handle(
        GetLawyerAvailabilitySlotsQuery request,
        CancellationToken cancellationToken)
    {
        var lawyerUserId = request.LawyerId?.Trim();
        if (string.IsNullOrWhiteSpace(lawyerUserId))
            throw new ArgumentException("LawyerId is required.");

        var query = _context.TIMESLOT
            .Where(ts => ts.LawyerId == lawyerUserId && ts.IsAvailable == true);

        if (request.StartDate.HasValue)
            query = query.Where(ts => ts.StartTime >= request.StartDate.Value);

        if (request.EndDate.HasValue)
        {
            var endOfDay = request.EndDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(ts => ts.StartTime <= endOfDay);
        }

        var results = await query
            .OrderBy(ts => ts.StartTime)
            .Select(ts => new GetAvailabilitySlotDto
            {
                TimeSlotId  = ts.TimeSlotId,
                Id          = ts.TimeSlotId.ToString(),
                LawyerId    = ts.LawyerId,
                StartTime   = ts.StartTime.ToString("o"),
                EndTime     = ts.EndTime.ToString("o"),
                IsAvailable = ts.IsAvailable ?? false,
                BookedBy    = ts.BookedBy,
                BookingId   = ts.BookingId,
                Booked      = ts.BookingId != null && ts.BookingId > 0,
                Date        = ts.StartTime.Date,
                Duration    = (int)(ts.EndTime - ts.StartTime).TotalMinutes,
                Price       = 0,
            })
            .ToListAsync(cancellationToken);

        return results;
    }
}

// ─── Get Single Slot By ID Query ──────────────────────────────────────────────

public record GetAvailabilitySlotByIdQuery(int TimeSlotId) : IRequest<GetAvailabilitySlotDto>;

public class GetAvailabilitySlotByIdQueryHandler
    : IRequestHandler<GetAvailabilitySlotByIdQuery, GetAvailabilitySlotDto>
{
    private readonly IApplicationDbContext _context;

    public GetAvailabilitySlotByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetAvailabilitySlotDto> Handle(
        GetAvailabilitySlotByIdQuery request,
        CancellationToken cancellationToken)
    {
        var ts = await _context.TIMESLOT
            .FirstOrDefaultAsync(s => s.TimeSlotId == request.TimeSlotId, cancellationToken)
            ?? throw new KeyNotFoundException($"Time slot {request.TimeSlotId} not found.");

        return new GetAvailabilitySlotDto
        {
            TimeSlotId  = ts.TimeSlotId,
            Id          = ts.TimeSlotId.ToString(),
            LawyerId    = ts.LawyerId,
            StartTime   = ts.StartTime.ToString("o"),
            EndTime     = ts.EndTime.ToString("o"),
            IsAvailable = ts.IsAvailable ?? false,
            BookedBy    = ts.BookedBy,
            BookingId   = ts.BookingId,
            Booked      = ts.BookingId != null && ts.BookingId > 0,
            Date        = ts.StartTime.Date,
            Duration    = (int)(ts.EndTime - ts.StartTime).TotalMinutes,
            Price       = 0,
        };
    }
}