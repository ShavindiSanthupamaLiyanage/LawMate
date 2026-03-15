using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerBooking.Commands;

public class UpdateBookingStatusCommand : IRequest<Unit>
{
    public int BookingId { get; set; }
    public UpdateBookingStatusDto Data { get; set; }
}

public class UpdateBookingStatusCommandHandler
    : IRequestHandler<UpdateBookingStatusCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAppLogger _logger;

    public UpdateBookingStatusCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAppLogger logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Unit> Handle(
        UpdateBookingStatusCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"UpdateBookingStatusCommand started for BookingId: {request.BookingId}");

        var dto = request.Data
            ?? throw new ArgumentNullException(nameof(request.Data));

        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(b => b.BookingId == request.BookingId, cancellationToken);

        if (booking == null)
        {
            _logger.Warning($"Status update failed | Booking not found: {request.BookingId}");
            throw new KeyNotFoundException($"Booking with ID {request.BookingId} not found");
        }

        var currentUser = _currentUserService.UserId ?? "SYSTEM";

        // Update the status
        booking.BookingStatus = dto.Status;
        booking.ModifiedBy = currentUser;
        booking.ModifiedAt = DateTime.Now;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Booking status updated | BookingId: {request.BookingId}, NewStatus: {dto.Status}");

        return Unit.Value;
    }
}
