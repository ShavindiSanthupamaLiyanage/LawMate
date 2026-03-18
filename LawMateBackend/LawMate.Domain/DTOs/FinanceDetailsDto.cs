using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class FinanceDetailsDto
{
    public string? LawyerId { get; set; }
    public string? FullName { get; set; }
    public string? NIC { get; set; }
    public string? Email { get; set; }
    public string? ContactNumber  { get; set; }
    public DateTime ScheduledDateTime { get; set; }
    public int Duration { get; set; }

    // Booking Payment Fields
    public int BookingId { get; set; }
    public string? TransactionId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public VerificationStatus VerificationStatus { get; set; }
    public string? RejectionReason { get; set; }
    public string? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public int PlatformCommission { get; set; }
    public int LawyerFee { get; set; }
    public bool IsPaid { get; set; }
    public string? SlipNumber { get; set; }
    public byte[]? ReceiptDocument { get; set; }
}