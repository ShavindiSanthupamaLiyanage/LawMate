using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.Bookings.Queries;

/// <summary>
/// Get all appointments/bookings for a specific client.
/// </summary>
public record GetClientAppointmentsQuery(string ClientId) : IRequest<List<BookingListResponseDto>>;

public class GetClientAppointmentsQueryHandler
    : IRequestHandler<GetClientAppointmentsQuery, List<BookingListResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetClientAppointmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<BookingListResponseDto>> Handle(
        GetClientAppointmentsQuery request,
        CancellationToken cancellationToken)
    {
        return await (
            from b in _context.BOOKING
            join lawyerUser in _context.USER_DETAIL on b.LawyerId equals lawyerUser.UserId into lj
            from lawyer in lj.DefaultIfEmpty()
            where b.ClientId == request.ClientId
            orderby b.ScheduledDateTime descending
            select new BookingListResponseDto
            {
                BookingId = b.BookingId,
                ClientId = b.ClientId,
                LawyerId = b.LawyerId,
                LawyerName = lawyer != null ? lawyer.FirstName + " " + lawyer.LastName : null,
                ScheduledDateTime = b.ScheduledDateTime,
                Duration = b.Duration,
                BookingStatus = b.BookingStatus,
                PaymentStatus = b.PaymentStatus,
                Amount = b.Amount
            }
        ).ToListAsync(cancellationToken);
    }
}

