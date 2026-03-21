using System.ComponentModel.DataAnnotations;
using LawMate.Domain.Entities.Auth;

namespace LawMate.Domain.Entities.Booking;

public class TIMESLOT
{
    [Key]
    public int TimeSlotId { get; set; }
    [Required]
    public string LawyerId { get; set; }
    public int BookingId { get; set; }
    [Required]
    public DateTime StartTime { get; set; }
    [Required]
    public DateTime EndTime { get; set; }
    [Required]
    public bool? IsAvailable { get; set; }
    public string? BookedBy { get; set; }
    [MaxLength(150)]
    public string? CreatedBy { get; set; }
    public DateTime? CreatedAt { get; set; }

    [MaxLength(150)]
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
}