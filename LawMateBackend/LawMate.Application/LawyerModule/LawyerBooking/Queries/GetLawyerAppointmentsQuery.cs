using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerBooking.Queries;

public record GetLawyerAppointmentsQuery(
    string    LawyerId,
    DateTime? StartDate = null,
    DateTime? EndDate   = null
) : IRequest<List<GetAppointmentDto>>;

public class GetLawyerAppointmentsQueryHandler
    : IRequestHandler<GetLawyerAppointmentsQuery, List<GetAppointmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerAppointmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetAppointmentDto>> Handle(
        GetLawyerAppointmentsQuery request,
        CancellationToken cancellationToken)
    {
        var query = from booking in _context.BOOKING
                    join client in _context.USER_DETAIL
                        on booking.ClientId   equals client.UserId
                    join slot in _context.TIMESLOT
                        on booking.TimeSlotId equals slot.TimeSlotId
                    where booking.LawyerId == request.LawyerId
                    select new { Booking = booking, Client = client, Slot = slot };

        if (request.StartDate.HasValue)
            query = query.Where(x => x.Booking.ScheduledDateTime >= request.StartDate.Value);

        if (request.EndDate.HasValue)
        {
            var endOfDay = request.EndDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(x => x.Booking.ScheduledDateTime <= endOfDay);
        }

        var results = await query
            .OrderBy(x => x.Booking.ScheduledDateTime)
            .Select(x => new GetAppointmentDto
            {
                // ── IDs ──────────────────────────────────────────────────
                BookingId     = x.Booking.BookingId,
                AppointmentId = "APT-" + x.Booking.BookingId.ToString().PadLeft(4, '0'),

                // ── Client ───────────────────────────────────────────────
                ClientId      = x.Booking.ClientId,
                ClientName    = x.Client.FirstName + " " + x.Client.LastName,
                Email         = x.Client.Email ?? string.Empty,
                ContactNumber = x.Client.ContactNumber,

                // ── Date & Time ──────────────────────────────────────────
                DateTime  = x.Booking.ScheduledDateTime,
                StartTime = x.Slot.StartTime.ToString("o"),
                EndTime   = x.Slot.EndTime.ToString("o"),
                Duration  = (int)((x.Slot.EndTime - x.Slot.StartTime).TotalMinutes),

                // ── Mode — "Physical" or "Online" string ─────────────────
                Mode = x.Booking.Mode == AppointmentMode.Physical
                           ? "Physical"
                           : "Online",

                // ── Payment ──────────────────────────────────────────────
                Price                = 2000,                        // always Rs.2000
                PaymentStatus        = x.Booking.PaymentStatus,
                PaymentStatusDisplay = x.Booking.PaymentStatus == PaymentStatus.Paid
                                           ? "Verified Payment"
                                           : x.Booking.PaymentStatus.ToString(),

                // ── Status ───────────────────────────────────────────────
                Status = x.Booking.BookingStatus == BookingStatus.Pending   ? "Pending"
                    : x.Booking.BookingStatus == BookingStatus.Accepted  ? "Accepted"
                    : x.Booking.BookingStatus == BookingStatus.Verified  ? "Verified"
                    : x.Booking.BookingStatus == BookingStatus.Rejected  ? "Rejected"
                    : x.Booking.BookingStatus == BookingStatus.Suspended ? "Suspended"
                    : x.Booking.BookingStatus == BookingStatus.Confirmed ? "Confirmed"
                    : x.Booking.BookingStatus == BookingStatus.Cancelled ? "Cancelled"
                    : "Pending",
                
                // ── CaseType enum → readable string ──────────────────────────────────
                CaseType = x.Booking.CaseType == LegalCategory.FamilyLaw   ? "Family Law"
                    : x.Booking.CaseType == LegalCategory.CriminalLaw ? "Criminal Law"
                    : x.Booking.CaseType == LegalCategory.PropertyLaw ? "Property Law"
                    : x.Booking.CaseType == LegalCategory.Cyber       ? "Cyber"
                    : "General",

                Notes  = x.Booking.IssueDescription,
            })
            .ToListAsync(cancellationToken);

        return results;
    }
}