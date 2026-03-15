using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class PaymentDto
{
    public string PaymentType { get; set; } = "";
    public string? TransactionId { get; set; }
    public string? LawyerId { get; set; }
    public decimal Amount { get; set; }
    public DateTime? PaymentDate { get; set; }
    public VerificationStatus VerificationStatus { get; set; }
    public string? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public string? RejectionReason { get; set; }
}