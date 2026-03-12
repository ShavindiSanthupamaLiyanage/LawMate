using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerBooking.Queries;

public record GetLawyerAppointmentsQuery(
    string LawyerId,
    DateTime? StartDate = null,
    DateTime? EndDate = null
) : IRequest<List<GetAppointmentDto>>;

public class GetLawyerAppointmentsQueryHandler
    : IRequestHandler<GetLawyerAppointmentsQuery, List<GetAppointmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerAppointmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetAppointmentDto>> Handle(
        GetLawyerAppointmentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = from booking in _context.BOOKING
                    join client in _context.USER_DETAIL on booking.ClientId equals client.UserId
                    where booking.LawyerId == request.LawyerId
                    select new
                    {
                        Booking = booking,
                        Client = client
                    };

        // Apply date filtering if provided
        if (request.StartDate.HasValue)
        {
            query = query.Where(x => x.Booking.ScheduledDateTime >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            var endOfDay = request.EndDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(x => x.Booking.ScheduledDateTime <= endOfDay);
        }

        var results = await query
            .OrderBy(x => x.Booking.ScheduledDateTime)
            .Select(x => new GetAppointmentDto
            {
                BookingId = x.Booking.BookingId,
                AppointmentId = "APT-" + x.Booking.BookingId.ToString().PadLeft(4, '0'),
                ClientId = x.Booking.ClientId,
                ClientName = x.Client.FirstName + " " + x.Client.LastName,
                Email = x.Client.Email ?? string.Empty,
                ContactNumber = x.Client.ContactNumber,
                CaseType = x.Booking.IssueDescription ?? "General Consultation",
                DateTime = x.Booking.ScheduledDateTime,
                Duration = x.Booking.Duration,
                Status = x.Booking.BookingStatus,
                Mode = "Physical", 
                Price = x.Booking.Amount,
                Notes = x.Booking.IssueDescription,
                PaymentStatus = x.Booking.PaymentStatus,
                PaymentStatusDisplay = x.Booking.PaymentStatus == PaymentStatus.Paid 
                    ? "Verified Payment" 
                    : x.Booking.PaymentStatus.ToString()
            })
            .ToListAsync(cancellationToken);

        return results;
    }
}
