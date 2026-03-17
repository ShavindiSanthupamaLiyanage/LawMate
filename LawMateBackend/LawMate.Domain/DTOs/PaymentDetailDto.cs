using LawMate.Domain.Common.Enums;

public class PaymentDetailDto
{
    public string PaymentType { get; set; }

    // Lawyer
    public string? LawyerId { get; set; }
    public string? LawyerName { get; set; }
    public string? LawyerEmail { get; set; }

    // Client (only for booking)
    public string? ClientId { get; set; }
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }

    public string? TransactionId { get; set; }
    public decimal Amount { get; set; }
    public DateTime? PaymentDate { get; set; }

    public VerificationStatus VerificationStatus { get; set; }
    public string? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }

    public string? RejectionReason { get; set; }

    public byte[]? ReceiptDocument { get; set; }
}