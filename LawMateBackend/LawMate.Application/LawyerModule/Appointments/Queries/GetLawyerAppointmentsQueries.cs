using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.Appointments.Queries;

/// <summary>
/// Get all appointments for a specific lawyer.
/// </summary>
public record GetLawyerAppointmentsQuery(string LawyerId) : IRequest<List<BookingListResponseDto>>;

public class GetLawyerAppointmentsQueryHandler
    : IRequestHandler<GetLawyerAppointmentsQuery, List<BookingListResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerAppointmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BookingListResponseDto>> Handle(
        GetLawyerAppointmentsQuery request,
        CancellationToken cancellationToken)
    {
        return await (
            from b in _context.BOOKING
            join clientUser in _context.USER_DETAIL on b.ClientId equals clientUser.UserId into cj
            from client in cj.DefaultIfEmpty()
            where b.LawyerId == request.LawyerId
            orderby b.ScheduledDateTime descending
            select new BookingListResponseDto
            {
                BookingId = b.BookingId,
                ClientId = b.ClientId,
                ClientName = client != null ? client.FirstName + " " + client.LastName : null,
                LawyerId = b.LawyerId,
                ScheduledDateTime = b.ScheduledDateTime,
                Duration = b.Duration,
                BookingStatus = b.BookingStatus,
                PaymentStatus = b.PaymentStatus,
                Amount = b.Amount
            }
        ).ToListAsync(cancellationToken);
    }
}

/// <summary>
/// Get appointments for a lawyer within a date range (calendar view).
/// </summary>
public class GetLawyerCalendarQuery : IRequest<List<BookingListResponseDto>>
{
    public string LawyerId { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class GetLawyerCalendarQueryHandler
    : IRequestHandler<GetLawyerCalendarQuery, List<BookingListResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerCalendarQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BookingListResponseDto>> Handle(
        GetLawyerCalendarQuery request,
        CancellationToken cancellationToken)
    {
        return await (
            from b in _context.BOOKING
            join clientUser in _context.USER_DETAIL on b.ClientId equals clientUser.UserId into cj
            from client in cj.DefaultIfEmpty()
            where b.LawyerId == request.LawyerId
                  && b.ScheduledDateTime >= request.StartDate
                  && b.ScheduledDateTime <= request.EndDate
            orderby b.ScheduledDateTime
            select new BookingListResponseDto
            {
                BookingId = b.BookingId,
                ClientId = b.ClientId,
                ClientName = client != null ? client.FirstName + " " + client.LastName : null,
                LawyerId = b.LawyerId,
                ScheduledDateTime = b.ScheduledDateTime,
                Duration = b.Duration,
                BookingStatus = b.BookingStatus,
                PaymentStatus = b.PaymentStatus,
                Amount = b.Amount
            }
        ).ToListAsync(cancellationToken);
    }
}
