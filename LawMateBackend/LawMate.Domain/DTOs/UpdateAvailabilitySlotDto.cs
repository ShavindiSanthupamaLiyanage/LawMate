using System.ComponentModel.DataAnnotations;

namespace LawMate.Domain.DTOs;

public class UpdateAvailabilitySlotDto
{
    public DateTime? Date { get; set; }
    
    public string? StartTime { get; set; } 
    
    [Range(15, 240)]
    public int? Duration { get; set; } 
    
    [Range(0, 1000000)]
    public decimal? Price { get; set; }
}
