using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs.Booking;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.Appointments.Commands;

/// <summary>
/// Lawyer creates an appointment for a specific client.
/// </summary>
public class CreateAppointmentByLawyerCommand : IRequest<BookingResponseDto>
{
    public string LawyerId { get; set; } = string.Empty;
    public CreateBookingByLawyerDto Data { get; set; } = null!;
}

public class CreateAppointmentByLawyerCommandHandler
    : IRequestHandler<CreateAppointmentByLawyerCommand, BookingResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public CreateAppointmentByLawyerCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<BookingResponseDto> Handle(
        CreateAppointmentByLawyerCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"CreateAppointmentByLawyerCommand | Lawyer: {request.LawyerId}");

        var dto = request.Data ?? throw new ArgumentNullException(nameof(request.Data));

        // Validate client exists
        var clientExists = await _context.USER_DETAIL
            .AnyAsync(u => u.UserId == dto.ClientId && u.UserRole == UserRole.Client, cancellationToken);
        if (!clientExists)
            throw new ArgumentException($"Client {dto.ClientId} not found.");

        // Validate time slot belongs to this lawyer and is available
        var slot = await _context.TIMESLOT
            .FirstOrDefaultAsync(t => t.TimeSlotId == dto.TimeSlotId && t.LawyerId == request.LawyerId, cancellationToken)
            ?? throw new ArgumentException($"Time slot {dto.TimeSlotId} not found for this lawyer.");

        if (slot.IsAvailable != true)
            throw new ArgumentException("This time slot is no longer available.");

        // Create booking
        var booking = new BOOKING
        {
            ClientId = dto.ClientId,
            LawyerId = request.LawyerId,
            TimeSlotId = dto.TimeSlotId,
            ScheduledDateTime = dto.ScheduledDateTime,
            Duration = dto.Duration,
            IssueDescription = dto.IssueDescription,
            BookingStatus = BookingStatus.Accepted, // Lawyer-created = auto-accepted
            Amount = dto.Amount,
            PaymentStatus = PaymentStatus.Pending,
            CreatedBy = request.LawyerId,
            CreatedAt = DateTime.UtcNow
        };

        _context.BOOKING.Add(booking);

        // Mark slot as unavailable
        slot.IsAvailable = false;
        slot.BookedBy = dto.ClientId;
        slot.ModifiedBy = request.LawyerId;
        slot.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        // Update slot with booking id
        slot.BookingId = booking.BookingId;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Appointment created by lawyer | BookingId: {booking.BookingId}");

        // Fetch names for response
        var lawyerUser = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.UserId == request.LawyerId, cancellationToken);
        var clientUser = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.UserId == dto.ClientId, cancellationToken);

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

