using System.ComponentModel.DataAnnotations;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Common;

namespace LawMate.Domain.Entities.Lawyer;

public class MEMBERSHIP_PAYMENT : AuditEntity
{
    [Required]
    public string LawyerId { get; set; }
    public string? TransactionId { get; set; }
    public decimal Amount { get; set; }
    public DateTime? PaymentDate { get; set; }
    public DateTime? MembershipStartDate { get; set; }
    public DateTime? MembershipEndDate { get; set; }
    [Required]
    public PaymentStatus PaymentStatus { get; set; }
    [Required]
    public VerificationStatus VerificationStatus { get; set; }
    public string? RejectionReason { get; set; }
    public string? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public byte[]? ReceiptDocument { get; set; }
    public bool IsExpired { get; set; }
}