using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Common;

namespace LawMate.Domain.Entities.Booking;

public class BOOKING : AuditEntity
{
    [Key]
    public int BookingId { get; set; }

    [Required]
    public int ClientId { get; set; }

    [Required]
    public int LawyerId { get; set; }

    [Required]
    public int TimeSlotId { get; set; }

    [Required]
    public DateTime ScheduledDateTime { get; set; }

    [Required]
    public int Duration { get; set; } // in minutes

    [MaxLength(1000)]
    public string IssueDescription { get; set; }

    [Required]
    public BookingStatus BookingStatus { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public PaymentStatus PaymentStatus { get; set; }
}