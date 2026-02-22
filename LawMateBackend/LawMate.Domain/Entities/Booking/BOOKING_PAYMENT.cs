using System.ComponentModel.DataAnnotations;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Common;

namespace LawMate.Domain.Entities.Booking;

public class BOOKING_PAYMENT : AuditEntity
{
    [Required]
    public int BookingId { get; set; }
    public string? TransactionId { get; set; }
    [Required]
    public decimal Amount { get; set; }
    [Required]
    public DateTime PaymentDate { get; set; }
    [Required]
    public VerificationStatus VerificationStatus{ get; set;}
    public string? RejectionReason { get; set; }
    public string? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }
}