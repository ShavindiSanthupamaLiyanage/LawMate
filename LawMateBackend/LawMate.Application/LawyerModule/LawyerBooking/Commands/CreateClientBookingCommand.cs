using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerBooking.Commands;

// ─── Command ──────────────────────────────────────────────────────────────────

public class CreateClientBookingCommand : IRequest<int>
{
    public string ClientId         { get; set; } = string.Empty;
    public ClientCreateBookingDto Data { get; set; } = null!;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

public class CreateClientBookingCommandHandler : IRequestHandler<CreateClientBookingCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateClientBookingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateClientBookingCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // ── Validate slot ──────────────────────────────────────────────────
        var slot = await _context.TIMESLOT
            .FirstOrDefaultAsync(s => s.TimeSlotId == data.TimeSlotId, cancellationToken)
            ?? throw new KeyNotFoundException($"Time slot {data.TimeSlotId} not found.");

        if (slot.IsAvailable != true)
            throw new InvalidOperationException("The selected time slot is no longer available.");

        // ── Create booking ─────────────────────────────────────────────────
        var booking = new BOOKING
        {
            ClientId          = request.ClientId,
            LawyerId          = data.LawyerId,
            TimeSlotId        = data.TimeSlotId,
            ScheduledDateTime = slot.StartTime,
            Duration          = (int)(slot.EndTime - slot.StartTime).TotalMinutes,
            IssueDescription  = data.IssueDescription,
            BookingStatus     = BookingStatus.Pending,
            PaymentStatus     = PaymentStatus.Pending,
            CaseType          = data.CaseType, 
            PaymentMode       = data.PaymentMode,
            Mode              = data.Mode,
            Location          = data.Mode == AppointmentMode.Physical ? data.Location : null,
            Amount            = 0,
            CreatedBy         = request.ClientId,
            CreatedAt         = DateTime.UtcNow,
        };

        _context.BOOKING.Add(booking);

        // ── Mark slot as taken ─────────────────────────────────────────────
        slot.IsAvailable = false;
        slot.BookedBy    = request.ClientId;
        slot.ModifiedAt  = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return booking.BookingId;
    }
}