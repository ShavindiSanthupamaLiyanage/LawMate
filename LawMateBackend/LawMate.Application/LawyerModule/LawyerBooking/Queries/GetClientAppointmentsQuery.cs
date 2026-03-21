using System.Security.Claims;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientBooking.Queries;

// ─── Query ────────────────────────────────────────────────────────────────────

public record GetClientAppointmentsQuery(string ClientId)
    : IRequest<List<GetAppointmentDto>>;

// ─── Handler ──────────────────────────────────────────────────────────────────

public class GetClientAppointmentsQueryHandler
    : IRequestHandler<GetClientAppointmentsQuery, List<GetAppointmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetClientAppointmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GetAppointmentDto>> Handle(
        GetClientAppointmentsQuery request,
        CancellationToken cancellationToken)
    {
        var results = await (
            from booking in _context.BOOKING
            join client in _context.USER_DETAIL
                on booking.ClientId   equals client.UserId
            join slot in _context.TIMESLOT
                on booking.TimeSlotId equals slot.TimeSlotId
            where booking.ClientId == request.ClientId
            orderby booking.ScheduledDateTime descending
            select new GetAppointmentDto
            {
                // ── IDs ──────────────────────────────────────────────────
                BookingId     = booking.BookingId,
                AppointmentId = "APT-" + booking.BookingId.ToString().PadLeft(4, '0'),

                // ── Client ───────────────────────────────────────────────
                ClientId      = booking.ClientId,
                ClientName    = client.FirstName + " " + client.LastName,
                Email         = client.Email ?? string.Empty,
                ContactNumber = client.ContactNumber,

                // ── Date & Time ──────────────────────────────────────────
                DateTime  = booking.ScheduledDateTime,
                StartTime = slot.StartTime.ToString("o"),
                EndTime   = slot.EndTime.ToString("o"),
                Duration  = (int)((slot.EndTime - slot.StartTime).TotalMinutes),

                // ── Mode ─────────────────────────────────────────────────
                Mode = booking.Mode == AppointmentMode.Physical
                           ? "Physical"
                           : "Online",

                // ── Payment ──────────────────────────────────────────────
                Price                = 2000,
                PaymentStatus        = booking.PaymentStatus,
                PaymentStatusDisplay = booking.PaymentStatus == PaymentStatus.Paid
                                           ? "Verified Payment"
                                           : booking.PaymentStatus.ToString(),

                // ── Status ───────────────────────────────────────────────
                Status = booking.BookingStatus == BookingStatus.Pending   ? "Pending"
                    : booking.BookingStatus == BookingStatus.Accepted  ? "Accepted"
                    : booking.BookingStatus == BookingStatus.Verified  ? "Verified"
                    : booking.BookingStatus == BookingStatus.Rejected  ? "Rejected"
                    : booking.BookingStatus == BookingStatus.Suspended ? "Suspended"
                    : booking.BookingStatus == BookingStatus.Confirmed ? "Confirmed"
                    : booking.BookingStatus == BookingStatus.Cancelled ? "Cancelled"
                    : "Pending",

                // ── Case & Notes ─────────────────────────────────────────
                CaseType = booking.CaseType == LegalCategory.FamilyLaw   ? "Family Law"
                    : booking.CaseType == LegalCategory.CriminalLaw ? "Criminal Law"
                    : booking.CaseType == LegalCategory.PropertyLaw ? "Property Law"
                    : booking.CaseType == LegalCategory.Cyber       ? "Cyber"
                    : "General",

                Notes           = booking.IssueDescription,
                RejectionReason = booking.RejectionReason,
            }
        ).ToListAsync(cancellationToken);

        return results;
    }
}