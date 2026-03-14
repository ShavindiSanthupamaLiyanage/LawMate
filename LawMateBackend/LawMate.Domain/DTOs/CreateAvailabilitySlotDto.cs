using System.ComponentModel.DataAnnotations;

namespace LawMate.Domain.DTOs;

public class CreateAvailabilitySlotDto
{
    [Required]
    public string LawyerId { get; set; }
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public string StartTime { get; set; }
    
    [Required]
    [Range(15, 240)]
    public int Duration { get; set; } 
    
    [Required]
    [Range(0, 1000000)]
    public decimal Price { get; set; }
}
