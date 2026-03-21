namespace LawMate.Domain.DTOs;

public class GetLawyerEventDto
{
    public int EventId { get; set; }
    public string EventCode { get; set; }
    public string LawyerId { get; set; }
    public string Title { get; set; }
    public string EventType { get; set; }
    public DateTime DateTime { get; set; }
    public int Duration { get; set; }
    public string Mode { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
}
