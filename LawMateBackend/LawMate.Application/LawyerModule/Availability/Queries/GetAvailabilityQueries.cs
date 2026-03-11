using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.Availability.Queries;

public record GetLawyerAvailabilityQuery(string LawyerId) : IRequest<List<TimeSlotResponseDto>>;

public class GetLawyerAvailabilityQueryHandler
    : IRequestHandler<GetLawyerAvailabilityQuery, List<TimeSlotResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerAvailabilityQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TimeSlotResponseDto>> Handle(
        GetLawyerAvailabilityQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.TIMESLOT
            .Where(t => t.LawyerId == request.LawyerId && t.StartTime >= DateTime.UtcNow)
            .OrderBy(t => t.StartTime)
            .Select(t => new TimeSlotResponseDto
            {
                TimeSlotId = t.TimeSlotId,
                LawyerId = t.LawyerId,
                BookingId = t.BookingId,
                StartTime = t.StartTime,
                EndTime = t.EndTime,
                IsAvailable = t.IsAvailable,
                BookedBy = t.BookedBy,
                CreatedBy = t.CreatedBy,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}

public record GetAvailabilityByMonthQuery(string LawyerId, int Month, int Year) : IRequest<List<TimeSlotResponseDto>>;

public class GetAvailabilityByMonthQueryHandler
    : IRequestHandler<GetAvailabilityByMonthQuery, List<TimeSlotResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAvailabilityByMonthQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TimeSlotResponseDto>> Handle(
        GetAvailabilityByMonthQuery request,
        CancellationToken cancellationToken)
    {
        var startDate = new DateTime(request.Year, request.Month, 1);
        var endDate = startDate.AddMonths(1);

        return await _context.TIMESLOT
            .Where(t => t.LawyerId == request.LawyerId
                        && t.StartTime >= startDate
                        && t.StartTime < endDate)
            .OrderBy(t => t.StartTime)
            .Select(t => new TimeSlotResponseDto
            {
                TimeSlotId = t.TimeSlotId,
                LawyerId = t.LawyerId,
                BookingId = t.BookingId,
                StartTime = t.StartTime,
                EndTime = t.EndTime,
                IsAvailable = t.IsAvailable,
                BookedBy = t.BookedBy,
                CreatedBy = t.CreatedBy,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}

