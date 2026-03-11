using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.Appointments.Commands;

/// <summary>
/// Update appointment status/details. Used by lawyers to accept/reject bookings.
/// </summary>
public class UpdateAppointmentCommand : IRequest<BookingResponseDto>
{
    public int BookingId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public UpdateBookingDto Data { get; set; } = null!;
}

public class UpdateAppointmentCommandHandler
    : IRequestHandler<UpdateAppointmentCommand, BookingResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public UpdateAppointmentCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<BookingResponseDto> Handle(
        UpdateAppointmentCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"UpdateAppointmentCommand | BookingId: {request.BookingId}");

        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(b => b.BookingId == request.BookingId, cancellationToken)
            ?? throw new KeyNotFoundException($"Booking {request.BookingId} not found.");

        // Only the lawyer or client involved can update
        if (booking.LawyerId != request.UserId && booking.ClientId != request.UserId)
            throw new UnauthorizedAccessException("You are not authorized to update this booking.");

        var dto = request.Data;

        if (dto.BookingStatus.HasValue)
        {
            booking.BookingStatus = dto.BookingStatus.Value;

            // If rejected, release the time slot
            if (dto.BookingStatus.Value == BookingStatus.Rejected)
            {
                var slot = await _context.TIMESLOT
                    .FirstOrDefaultAsync(t => t.TimeSlotId == booking.TimeSlotId, cancellationToken);
                if (slot != null)
                {
                    slot.IsAvailable = true;
                    slot.BookedBy = null;
                    slot.BookingId = 0;
                    slot.ModifiedBy = request.UserId;
                    slot.ModifiedAt = DateTime.UtcNow;
                }
            }
        }

        if (dto.ScheduledDateTime.HasValue)
            booking.ScheduledDateTime = dto.ScheduledDateTime.Value;

        if (dto.Duration.HasValue)
            booking.Duration = dto.Duration.Value;

        if (dto.IssueDescription != null)
            booking.IssueDescription = dto.IssueDescription;

        booking.ModifiedBy = request.UserId;
        booking.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Appointment updated | BookingId: {booking.BookingId} | Status: {booking.BookingStatus}");

        var lawyerUser = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.UserId == booking.LawyerId, cancellationToken);
        var clientUser = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.UserId == booking.ClientId, cancellationToken);

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
            CreatedAt = booking.CreatedAt,
            ModifiedBy = booking.ModifiedBy,
            ModifiedAt = booking.ModifiedAt
        };
    }
}

