using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerEvent.Queries;

public record GetLawyerEventsQuery(
    string LawyerId,
    DateTime? StartDate = null,
    DateTime? EndDate = null
) : IRequest<List<GetLawyerEventDto>>;

public class GetLawyerEventsQueryHandler
    : IRequestHandler<GetLawyerEventsQuery, List<GetLawyerEventDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerEventsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetLawyerEventDto>> Handle(
        GetLawyerEventsQuery request,
        CancellationToken cancellationToken)
    {
        var lawyerUserId = request.LawyerId?.Trim();
        if (string.IsNullOrWhiteSpace(lawyerUserId))
        {
            throw new ArgumentException("LawyerId is required.");
        }

        var query = _context.LAWYER_EVENT
            .Where(e => e.LawyerId == lawyerUserId);

        if (request.StartDate.HasValue)
        {
            query = query.Where(e => e.EventDateTime >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            var endOfDay = request.EndDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(e => e.EventDateTime <= endOfDay);
        }

        var events = await query
            .OrderBy(e => e.EventDateTime)
            .Select(e => new GetLawyerEventDto
            {
                EventId = e.EventId,
                EventCode = string.Empty,
                LawyerId = e.LawyerId,
                Title = e.Title,
                EventType = e.EventType,
                DateTime = e.EventDateTime,
                Duration = e.Duration,
                Mode = e.Mode,
                Location = e.Location,
                Notes = e.Notes
            })
            .ToListAsync(cancellationToken);

        foreach (var lawyerEvent in events)
        {
            lawyerEvent.EventCode = $"EVT-{lawyerEvent.EventId:D4}";
        }

        return events;
    }
}
