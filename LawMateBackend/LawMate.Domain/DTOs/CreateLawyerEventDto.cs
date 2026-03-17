using System.ComponentModel.DataAnnotations;

namespace LawMate.Domain.DTOs;

public class CreateLawyerEventDto
{
    [Required]
    public string LawyerId { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; }

    [Required]
    [MaxLength(80)]
    public string EventType { get; set; }

    [Required]
    public DateTime DateTime { get; set; }

    [Required]
    [Range(15, 720)]
    public int Duration { get; set; }

    [Required]
    public string Mode { get; set; }

    public string? Location { get; set; }

    public string? Notes { get; set; }
}
