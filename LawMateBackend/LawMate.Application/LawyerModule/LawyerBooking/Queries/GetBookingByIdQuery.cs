using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerBooking.Queries;

public record GetBookingByIdQuery(int BookingId) : IRequest<GetAppointmentDto>;

public class GetBookingByIdQueryHandler
    : IRequestHandler<GetBookingByIdQuery, GetAppointmentDto>
{
    private readonly IApplicationDbContext _context;

    public GetBookingByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetAppointmentDto> Handle(
        GetBookingByIdQuery request,
        CancellationToken cancellationToken)
    {
        var result = await (
            from booking in _context.BOOKING
            join client in _context.USER_DETAIL on booking.ClientId equals client.UserId
            where booking.BookingId == request.BookingId
            select new GetAppointmentDto
            {
                BookingId = booking.BookingId,
                AppointmentId = "APT-" + booking.BookingId.ToString().PadLeft(4, '0'),
                ClientId = booking.ClientId,
                ClientName = client.FirstName + " " + client.LastName,
                Email = client.Email ?? string.Empty,
                ContactNumber = client.ContactNumber,
                CaseType = booking.IssueDescription ?? "General Consultation",
                DateTime = booking.ScheduledDateTime,
                Duration = booking.Duration,
                Status = booking.BookingStatus,
                Mode = "Physical", 
                Price = booking.Amount,
                Notes = booking.IssueDescription,
                PaymentStatus = booking.PaymentStatus,
                PaymentStatusDisplay = booking.PaymentStatus == PaymentStatus.Paid 
                    ? "Verified Payment" 
                    : booking.PaymentStatus.ToString()
            }
        ).FirstOrDefaultAsync(cancellationToken);

        if (result == null)
            throw new KeyNotFoundException($"Booking with ID {request.BookingId} not found");

        return result;
    }
}
