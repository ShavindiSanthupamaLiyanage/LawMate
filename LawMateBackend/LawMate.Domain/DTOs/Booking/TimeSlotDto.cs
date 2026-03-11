namespace LawMate.Domain.DTOs.Booking;

public class CreateTimeSlotDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}

public class UpdateTimeSlotDto
{
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool? IsAvailable { get; set; }
}

public class TimeSlotResponseDto
{
    public int TimeSlotId { get; set; }
    public string LawyerId { get; set; } = string.Empty;
    public int BookingId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool? IsAvailable { get; set; }
    public string? BookedBy { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? CreatedAt { get; set; }
}


