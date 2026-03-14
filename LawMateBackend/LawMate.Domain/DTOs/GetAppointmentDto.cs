using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class GetAppointmentDto
{
    public int BookingId { get; set; }
    public string AppointmentId { get; set; }
    

    public string ClientId { get; set; }
    public string ClientName { get; set; }
    public string Email { get; set; }
    public string? ContactNumber { get; set; }
    
  
    public string CaseType { get; set; }
    public DateTime DateTime { get; set; }
    public int Duration { get; set; } 
    public BookingStatus Status { get; set; }
    public string Mode { get; set; } 
    public decimal Price { get; set; }
    public string? Notes { get; set; }
    
  
    public PaymentStatus PaymentStatus { get; set; }
    public string PaymentStatusDisplay { get; set; } 
}
