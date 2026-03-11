using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.Bookings.Queries;

/// <summary>
/// Get a specific appointment/booking by ID with full details.
/// </summary>
public record GetBookingByIdQuery(int BookingId) : IRequest<BookingResponseDto>;

public class GetBookingByIdQueryHandler
    : IRequestHandler<GetBookingByIdQuery, BookingResponseDto>
{
    private readonly IApplicationDbContext _context;

    public GetBookingByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BookingResponseDto> Handle(
        GetBookingByIdQuery request,
        CancellationToken cancellationToken)
    {
        var result = await (
            from b in _context.BOOKING
            join clientUser in _context.USER_DETAIL on b.ClientId equals clientUser.UserId into cj
            from client in cj.DefaultIfEmpty()
            join lawyerUser in _context.USER_DETAIL on b.LawyerId equals lawyerUser.UserId into lj
            from lawyer in lj.DefaultIfEmpty()
            where b.BookingId == request.BookingId
            select new BookingResponseDto
            {
                BookingId = b.BookingId,
                ClientId = b.ClientId,
                ClientName = client != null ? client.FirstName + " " + client.LastName : null,
                LawyerId = b.LawyerId,
                LawyerName = lawyer != null ? lawyer.FirstName + " " + lawyer.LastName : null,
                TimeSlotId = b.TimeSlotId,
                ScheduledDateTime = b.ScheduledDateTime,
                Duration = b.Duration,
                IssueDescription = b.IssueDescription,
                BookingStatus = b.BookingStatus,
                Amount = b.Amount,
                PaymentStatus = b.PaymentStatus,
                CreatedBy = b.CreatedBy,
                CreatedAt = b.CreatedAt,
                ModifiedBy = b.ModifiedBy,
                ModifiedAt = b.ModifiedAt
            }
        ).FirstOrDefaultAsync(cancellationToken);

        return result ?? throw new KeyNotFoundException($"Booking {request.BookingId} not found.");
    }
}

