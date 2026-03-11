using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs.Booking;

public class BookingPaymentResponseDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public string? TransactionId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public VerificationStatus VerificationStatus { get; set; }
    public string? RejectionReason { get; set; }
    public string? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }
}

public class VerifyPaymentDto
{
    public int BookingId { get; set; }
    public string? TransactionId { get; set; }
    public decimal Amount { get; set; }
}

public class RefundPaymentDto
{
    public int BookingId { get; set; }
    public string? Reason { get; set; }
}

