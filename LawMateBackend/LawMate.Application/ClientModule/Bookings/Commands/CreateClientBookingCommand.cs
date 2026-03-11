using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs.Booking;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.Bookings.Commands;

/// <summary>
/// Client requests an appointment from an available time slot.
/// Enforces: at least 3 days advance, max 3 months ahead.
/// </summary>
public class CreateClientBookingCommand : IRequest<BookingResponseDto>
{
    public string ClientId { get; set; } = string.Empty;
    public CreateBookingDto Data { get; set; } = null!;
}

public class CreateClientBookingCommandHandler
    : IRequestHandler<CreateClientBookingCommand, BookingResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public CreateClientBookingCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<BookingResponseDto> Handle(
        CreateClientBookingCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"CreateClientBookingCommand | Client: {request.ClientId}");

        var dto = request.Data ?? throw new ArgumentNullException(nameof(request.Data));

        // Validate the time slot exists and is available
        var slot = await _context.TIMESLOT
            .FirstOrDefaultAsync(t => t.TimeSlotId == dto.TimeSlotId
                                      && t.LawyerId == dto.LawyerId, cancellationToken)
            ?? throw new ArgumentException($"Time slot {dto.TimeSlotId} not found for lawyer {dto.LawyerId}.");

        if (slot.IsAvailable != true)
            throw new ArgumentException("This time slot is no longer available.");

        // Validate booking constraints: at least 3 days in advance
        var minBookingDate = DateTime.UtcNow.AddDays(3);
        if (slot.StartTime < minBookingDate)
            throw new ArgumentException("Bookings must be made at least 3 days in advance.");

        // Validate: max 3 months ahead
        var maxBookingDate = DateTime.UtcNow.AddMonths(3);
        if (slot.StartTime > maxBookingDate)
            throw new ArgumentException("Bookings cannot be made more than 3 months in advance.");

        // Calculate duration from slot
        var duration = (int)(slot.EndTime - slot.StartTime).TotalMinutes;

        // Create booking
        var booking = new BOOKING
        {
            ClientId = request.ClientId,
            LawyerId = dto.LawyerId,
            TimeSlotId = dto.TimeSlotId,
            ScheduledDateTime = slot.StartTime,
            Duration = duration,
            IssueDescription = dto.IssueDescription,
            BookingStatus = BookingStatus.Pending,
            Amount = 0, // To be set by lawyer or system
            PaymentStatus = PaymentStatus.Pending,
            CreatedBy = request.ClientId,
            CreatedAt = DateTime.UtcNow
        };

        _context.BOOKING.Add(booking);

        // Reserve the slot
        slot.IsAvailable = false;
        slot.BookedBy = request.ClientId;
        slot.ModifiedBy = request.ClientId;
        slot.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Update slot with booking id
        slot.BookingId = booking.BookingId;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Client booking created | BookingId: {booking.BookingId} | Client: {request.ClientId}");

        // Fetch names for response
        var lawyerUser = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.UserId == dto.LawyerId, cancellationToken);
        var clientUser = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.UserId == request.ClientId, cancellationToken);

        return new BookingResponseDto
        {
            BookingId = booking.BookingId,
            ClientId = booking.ClientId,
            ClientName = clientUser != null ? $"{clientUser.FirstName} {clientUser.LastName}" : null,
            LawyerId = booking.LawyerId,
            LawyerName = lawyerUser != null ? $"{lawyerUser.FirstName} {lawyerUser.LastName}" : null,
            TimeSlotId = booking.TimeSlotId,
            ScheduledDateTime = booking.ScheduledDateTime,
            Duration = booking.Duration,
            IssueDescription = booking.IssueDescription,
            BookingStatus = booking.BookingStatus,
            Amount = booking.Amount,
            PaymentStatus = booking.PaymentStatus,
            CreatedBy = booking.CreatedBy,
            CreatedAt = booking.CreatedAt
        };
    }
}

