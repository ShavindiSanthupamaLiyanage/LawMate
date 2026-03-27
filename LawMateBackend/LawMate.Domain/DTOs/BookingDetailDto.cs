using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class BookingDetailDto
{
    public int BookingId { get; set; }

    // Client info
    public string ClientName { get; set; } = string.Empty;
    public byte[]? ProfilePicUrl { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Nic { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    // Case details
    public string CaseType { get; set; } = string.Empty;
    public string? CaseNote { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    // Appointment info
    public DateTime ScheduledDateTime { get; set; }
    public int Duration { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public string? Location { get; set; }
    public BookingStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public AppointmentMode Mode { get; set; } 
}