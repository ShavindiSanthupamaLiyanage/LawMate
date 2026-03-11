using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs.Booking;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.Bookings.Commands;

/// <summary>
/// Update consultation status (Scheduled/InProgress/Completed/Cancelled/NoShow).
/// </summary>
public class UpdateConsultationCommand : IRequest<ConsultationResponseDto>
{
    public int BookingId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public UpdateConsultationDto Data { get; set; } = null!;
}

public class UpdateConsultationCommandHandler
    : IRequestHandler<UpdateConsultationCommand, ConsultationResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public UpdateConsultationCommandHandler(IApplicationDbContext context, IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ConsultationResponseDto> Handle(
        UpdateConsultationCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"UpdateConsultationCommand | BookingId: {request.BookingId}");

        // Validate booking exists
        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(b => b.BookingId == request.BookingId, cancellationToken)
            ?? throw new KeyNotFoundException($"Booking {request.BookingId} not found.");

        // Only the lawyer involved can update consultation status
        if (booking.LawyerId != request.UserId)
            throw new UnauthorizedAccessException("Only the assigned lawyer can update consultation status.");

        // Booking must be in Verified status (payment confirmed)
        if (booking.BookingStatus != BookingStatus.Verified && booking.BookingStatus != BookingStatus.Accepted)
            throw new ArgumentException("Booking must be accepted or payment-verified to manage consultation.");

        // Get or create consultation record
        var consultation = await _context.CONSULTATION
            .FirstOrDefaultAsync(c => c.BookingId == request.BookingId, cancellationToken);

        if (consultation == null)
        {
            consultation = new CONSULTATION
            {
                BookingId = request.BookingId,
                StartTime = booking.ScheduledDateTime,
                EndTime = booking.ScheduledDateTime.AddMinutes(booking.Duration),
                ConsultationStatus = request.Data.ConsultationStatus,
                IsCompleted = request.Data.ConsultationStatus == ConsultationStatus.Completed,
                CreatedBy = request.UserId,
                CreatedAt = DateTime.UtcNow
            };
            _context.CONSULTATION.Add(consultation);
        }
        else
        {
            consultation.ConsultationStatus = request.Data.ConsultationStatus;
            consultation.IsCompleted = request.Data.ConsultationStatus == ConsultationStatus.Completed;
            consultation.ModifiedBy = request.UserId;
            consultation.ModifiedAt = DateTime.UtcNow;

            // Set actual start time when status changes to InProgress
            if (request.Data.ConsultationStatus == ConsultationStatus.InProgress)
                consultation.StartTime = DateTime.UtcNow;

            // Set actual end time when completed
            if (request.Data.ConsultationStatus == ConsultationStatus.Completed)
                consultation.EndTime = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Consultation updated | BookingId: {request.BookingId} | Status: {consultation.ConsultationStatus}");

        return new ConsultationResponseDto
        {
            Id = consultation.Id,
            BookingId = consultation.BookingId,
            StartTime = consultation.StartTime,
            EndTime = consultation.EndTime,
            ConsultationStatus = consultation.ConsultationStatus,
            IsCompleted = consultation.IsCompleted,
            CreatedBy = consultation.CreatedBy,
            CreatedAt = consultation.CreatedAt
        };
    }
}

/// <summary>
/// Mark consultation as completed (convenience endpoint).
/// </summary>
public class CompleteConsultationCommand : IRequest<ConsultationResponseDto>
{
    public int BookingId { get; set; }
    public string UserId { get; set; } = string.Empty;
}

public class CompleteConsultationCommandHandler
    : IRequestHandler<CompleteConsultationCommand, ConsultationResponseDto>
{
    private readonly IMediator _mediator;

    public CompleteConsultationCommandHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<ConsultationResponseDto> Handle(
        CompleteConsultationCommand request,
        CancellationToken cancellationToken)
    {
        return await _mediator.Send(new UpdateConsultationCommand
        {
            BookingId = request.BookingId,
            UserId = request.UserId,
            Data = new UpdateConsultationDto
            {
                ConsultationStatus = ConsultationStatus.Completed
            }
        }, cancellationToken);
    }
}

