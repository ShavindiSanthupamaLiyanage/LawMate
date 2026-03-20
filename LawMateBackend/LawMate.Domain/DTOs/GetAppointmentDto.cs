using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class GetAppointmentDto
{
    public int    BookingId         { get; set; }
    public string AppointmentId     { get; set; } = string.Empty;

    public string  ClientId         { get; set; } = string.Empty;
    public string  ClientName       { get; set; } = string.Empty;
    public string  Email            { get; set; } = string.Empty;
    public string? ContactNumber    { get; set; }

    public string   CaseType        { get; set; } = string.Empty;
    public DateTime DateTime        { get; set; }           // BOOKING.ScheduledDateTime
    public string   StartTime       { get; set; } = string.Empty;  // TIMESLOT.StartTime ISO
    public string   EndTime         { get; set; } = string.Empty;  // TIMESLOT.EndTime ISO
    public int      Duration        { get; set; }
    public string   Status          { get; set; } = string.Empty;
    public string   Mode            { get; set; } = string.Empty;  // "Physical" | "Online"
    public decimal  Price           { get; set; }
    public string?  Notes           { get; set; }

    public PaymentStatus PaymentStatus        { get; set; }
    public string        PaymentStatusDisplay { get; set; } = string.Empty;
    
    // ── Rejection ─────────────────────────────────────────────────────────────
    public string? RejectionReason { get; set; }   // ← populated when Rejected
}