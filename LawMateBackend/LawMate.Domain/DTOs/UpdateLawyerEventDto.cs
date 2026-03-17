namespace LawMate.Domain.DTOs;

public class UpdateLawyerEventDto
{
    public string? Title { get; set; }

    public string? EventType { get; set; }

    public DateTime? DateTime { get; set; }

    public int? Duration { get; set; }

    public string? Mode { get; set; }

    public string? Location { get; set; }

    public string? Notes { get; set; }
}
