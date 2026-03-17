using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerAvailability.Queries;

public record GetLawyerAvailabilitySlotsQuery(
    string LawyerId,
    DateTime? StartDate = null,
    DateTime? EndDate = null
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
        {
            throw new ArgumentException("LawyerId is required.");
        }

        var query = _context.TIMESLOT
            .Where(ts => ts.LawyerId == lawyerUserId);

        // Apply date filtering if provided
        if (request.StartDate.HasValue)
        {
            query = query.Where(ts => ts.StartTime >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            var endOfDay = request.EndDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(ts => ts.StartTime <= endOfDay);
        }

        var results = await query
            .OrderBy(ts => ts.StartTime)
            .Select(ts => new GetAvailabilitySlotDto
            {
                TimeSlotId = ts.TimeSlotId,
                Id = ts.TimeSlotId.ToString(),
                Date = ts.StartTime.Date,
                StartTime = ts.StartTime.ToString("HH:mm"),
                Price = 0, // TODO: Add Price field to TIMESLOT entity, or derive from BOOKING
                Duration = (int)(ts.EndTime - ts.StartTime).TotalMinutes,
                Booked = ts.BookingId != null && ts.BookingId > 0,
                BookedBy = ts.BookedBy,
                BookingId = ts.BookingId
            })
            .ToListAsync(cancellationToken);

        return results;
    }
}
