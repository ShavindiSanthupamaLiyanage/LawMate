namespace LawMate.Domain.DTOs;

public class GetAvailabilitySlotDto
{
    public int TimeSlotId { get; set; }
    public string Id { get; set; } 
    public DateTime Date { get; set; }
    public string StartTime { get; set; }
    public decimal Price { get; set; }
    public int Duration { get; set; } 
    public bool Booked { get; set; }
    public string? BookedBy { get; set; }
    public int? BookingId { get; set; }
}
