using System.ComponentModel.DataAnnotations;
using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class CreateManualBookingDto
{
    [Required]
    public string LawyerId { get; set; }
    
    [Required]
    [EmailAddress]
    public string ClientEmail { get; set; }
    
    [Required]
    public string ClientName { get; set; }
    
    public string? ContactNumber { get; set; }
    
    [Required]
    public DateTime DateTime { get; set; }
    
    [Required]
    [Range(15, 240)]
    public int Duration { get; set; }
    
    [Required]
    public decimal Price { get; set; }
    
    [Required]
    public string Mode { get; set; }
    
    public string? Notes { get; set; }
    
    public int? TimeSlotId { get; set; }
    public string? Location { get; set; }
    public PaymentMode PaymentMode { get; set; } = PaymentMode.Online; 
    
    public LegalCategory CaseType   { get; set; } 
}
