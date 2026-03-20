using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

/// <summary>
/// Unified appointment DTO returned by:
///   GET /api/bookings/lawyer/{lawyerId}
///   GET /api/bookings/{bookingId}
///   GET /api/client/appointments
/// </summary>
public class GetAppointmentDto
{
    // ── IDs ───────────────────────────────────────────────────────────────────
    public int    BookingId     { get; set; }
    public string AppointmentId { get; set; } = string.Empty;

    // ── Client ────────────────────────────────────────────────────────────────
    public string  ClientId      { get; set; } = string.Empty;
    public string  ClientName    { get; set; } = string.Empty;
    public string  Email         { get; set; } = string.Empty;
    public string? ContactNumber { get; set; }

    // ── Lawyer ────────────────────────────────────────────────────────────────
    public string? LawyerName { get; set; }   // populated via second USER_DETAIL join

    // ── Date & Time ───────────────────────────────────────────────────────────
    public DateTime DateTime  { get; set; }
    public string   StartTime { get; set; } = string.Empty;
    public string   EndTime   { get; set; } = string.Empty;
    public int      Duration  { get; set; }

    // ── Mode ──────────────────────────────────────────────────────────────────
    public string Mode { get; set; } = string.Empty;

    // ── Payment ───────────────────────────────────────────────────────────────
    public int           Price                { get; set; }
    public PaymentStatus PaymentStatus        { get; set; }
    public string        PaymentStatusDisplay { get; set; } = string.Empty;

    // ── Status ────────────────────────────────────────────────────────────────
    public string Status { get; set; } = string.Empty;

    // ── Rejection ─────────────────────────────────────────────────────────────
    public string? RejectionReason { get; set; }

    // ── Case ──────────────────────────────────────────────────────────────────
    public string  CaseType { get; set; } = string.Empty;
    public string? Notes    { get; set; }
}