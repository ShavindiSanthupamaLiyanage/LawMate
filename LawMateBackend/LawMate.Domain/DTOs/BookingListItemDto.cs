using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class BookingListItemDto
{
    public int BookingId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public byte[]? ProfilePicUrl { get; set; }
    public string CaseType { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime ScheduledDateTime { get; set; }
    public PaymentMode Mode { get; set; }
    public BookingStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; }
}