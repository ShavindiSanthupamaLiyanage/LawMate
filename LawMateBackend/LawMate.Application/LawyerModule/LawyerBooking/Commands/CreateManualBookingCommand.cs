using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerBooking.Commands;

public class CreateManualBookingCommand : IRequest<int>
{
    public CreateManualBookingDto Data { get; set; }
}

public class CreateManualBookingCommandHandler
    : IRequestHandler<CreateManualBookingCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAppLogger _logger;

    public CreateManualBookingCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAppLogger logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<int> Handle(
        CreateManualBookingCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info("CreateManualBookingCommand started");

        var dto = request.Data
            ?? throw new ArgumentNullException(nameof(request.Data));

        var lawyerUserId = dto.LawyerId?.Trim();
        if (string.IsNullOrWhiteSpace(lawyerUserId))
        {
            throw new ArgumentException("LawyerId is required.");
        }

        // Validate lawyer by public UserId (e.g., LAW002), not internal numeric Id.
        var lawyerExists = await _context.USER_DETAIL
            .AnyAsync(u => u.UserId == lawyerUserId && u.UserRole == UserRole.Lawyer, cancellationToken);

        if (!lawyerExists)
        {
            _logger.Warning($"Manual booking failed | Lawyer not found: {lawyerUserId}");
            throw new KeyNotFoundException($"Lawyer with ID {lawyerUserId} not found");
        }

        // Validate client exists
        var client = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.Email == dto.ClientEmail && u.UserRole == UserRole.Client,
                cancellationToken);

        if (client == null)
        {
            _logger.Warning($"Manual booking failed | Client not found with email: {dto.ClientEmail}");
            throw new KeyNotFoundException($"Client with email {dto.ClientEmail} not found. Please ensure the client is registered.");
        }

        var currentUser = _currentUserService.UserId ?? "SYSTEM";

       
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            TIMESLOT? timeSlot = null;

           
            if (dto.TimeSlotId.HasValue)
            {
                timeSlot = await _context.TIMESLOT
                    .FirstOrDefaultAsync(ts => ts.TimeSlotId == dto.TimeSlotId.Value, cancellationToken);

                if (timeSlot == null)
                {
                    throw new KeyNotFoundException($"TimeSlot with ID {dto.TimeSlotId.Value} not found");
                }

                if (timeSlot.LawyerId != lawyerUserId)
                {
                    throw new InvalidOperationException($"TimeSlot {dto.TimeSlotId.Value} does not belong to lawyer {lawyerUserId}");
                }

                if (timeSlot.IsAvailable == false)
                {
                    throw new InvalidOperationException($"TimeSlot {dto.TimeSlotId.Value} is already booked");
                }
            }
            else
            {
                var endTime = dto.DateTime.AddMinutes(dto.Duration);

                timeSlot = new TIMESLOT
                {
                    LawyerId = lawyerUserId,
                    StartTime = dto.DateTime,
                    EndTime = endTime,
                    IsAvailable = false,
                    CreatedBy = currentUser,
                    CreatedAt = DateTime.Now
                };

                _context.TIMESLOT.Add(timeSlot);
                await _context.SaveChangesAsync(cancellationToken);
            }

        
            var booking = new BOOKING
            {
                ClientId = client.UserId,
                LawyerId = lawyerUserId,
                TimeSlotId = timeSlot.TimeSlotId,
                ScheduledDateTime = dto.DateTime,
                Duration = dto.Duration,
                IssueDescription = dto.CaseType + (string.IsNullOrEmpty(dto.Notes) ? "" : " - " + dto.Notes),
                BookingStatus = BookingStatus.Accepted, 
                Amount = dto.Price,
                PaymentStatus = PaymentStatus.Pending,
                CreatedBy = currentUser,
                CreatedAt = DateTime.Now
            };

            _context.BOOKING.Add(booking);
            await _context.SaveChangesAsync(cancellationToken);

           
            timeSlot.BookingId = booking.BookingId;
            timeSlot.IsAvailable = false;
            timeSlot.BookedBy = client.UserId;
            timeSlot.ModifiedBy = currentUser;
            timeSlot.ModifiedAt = DateTime.Now;

            await _context.SaveChangesAsync(cancellationToken);

          
            await transaction.CommitAsync(cancellationToken);

            _logger.Info($"Manual booking created | BookingId: {booking.BookingId}, LawyerId: {lawyerUserId}, ClientId: {client.UserId}");

            return booking.BookingId;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            _logger.Error("Manual booking creation failed", ex);
            throw;
        }
    }
}
