using System.ComponentModel.DataAnnotations;
using LawMate.Domain.Entities.Auth;

namespace LawMate.Domain.Entities.Booking;

public class TIMESLOT
{
    [Key]
    public int TimeSlotId { get; set; }
    [Required]
    public int UserId { get; set; }
    [Required]
    public int BookingId { get; set; }
    [Required]
    public DateTime StartTime { get; set; }
    [Required]
    public DateTime EndTime { get; set; }
    [Required]
    public bool? IsAvailable { get; set; }
}