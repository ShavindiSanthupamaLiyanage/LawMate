using System.ComponentModel.DataAnnotations;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Common;

namespace LawMate.Domain.Entities.Booking;

public class CONSULTATION : AuditEntity
{
    [Key]
    public int Id { get; set; }
    [Required]
    public int BookingId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }
    [Required]
    public ConsultationStatus ConsultationStatus { get; set; }
    [Required]
    public bool? IsCompleted { get; set; }
}