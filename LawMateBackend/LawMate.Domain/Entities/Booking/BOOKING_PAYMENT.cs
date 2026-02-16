using System.ComponentModel.DataAnnotations;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Common;

namespace LawMate.Domain.Entities.Booking;

public class BOOKING_PAYMENT : AuditEntity
{
    [Key]
    public int Id { get; set; }
    [Required]
    public int BookingId { get; set; }
    [Required]
    public string TransactionId { get; set; }
    [Required]
    public decimal Amount { get; set; }
    [Required]
    public DateTime PaymentDate { get; set; }
    [Required]
    public VerificationStatus VerificationStatus{ get; set;}
}