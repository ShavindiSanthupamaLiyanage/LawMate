using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Common;

namespace LawMate.Domain.Entities.Booking;

public class BOOKING
{
    [Key]
    public int BookingId { get; set; }

    [Required]
    public string ClientId { get; set; }

    [Required]
    public string LawyerId { get; set; }

    [Required]
    public int TimeSlotId { get; set; }

    [Required]
    public DateTime ScheduledDateTime { get; set; }

    [Required]
    public int Duration { get; set; } // in minutes

    [MaxLength(1000)]
    public string? IssueDescription { get; set; }

    [Required]
    public BookingStatus BookingStatus { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public PaymentStatus PaymentStatus { get; set; }
    
    [MaxLength(150)]
    public string? CreatedBy { get; set; }
    
    public DateTime? CreatedAt { get; set; }

    [MaxLength(150)]
    public string? ModifiedBy { get; set; }
    
    public DateTime? ModifiedAt { get; set; }
}