using System.ComponentModel.DataAnnotations;

namespace LawMate.Domain.Entities.Booking;

public class LAWYER_EVENT
{
    [Key]
    public int EventId { get; set; }

    [Required]
    public string LawyerId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; }

    [Required]
    [MaxLength(80)]
    public string EventType { get; set; }

    [Required]
    public DateTime EventDateTime { get; set; }

    [Required]
    [Range(15, 720)]
    public int Duration { get; set; }

    [Required]
    [MaxLength(20)]
    public string Mode { get; set; }

    [MaxLength(250)]
    public string? Location { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [MaxLength(150)]
    public string? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    [MaxLength(150)]
    public string? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }
}
