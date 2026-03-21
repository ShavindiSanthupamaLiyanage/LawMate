namespace LawMate.Domain.DTOs;

public class PlatformCommissionReportDto
{
    public int BookingId { get; set; } 
    public DateTime? ScheduledDateTime { get; set; }
    public string? ClientName { get; set; } 
    public string? ClientEmail { get; set; } 
    public string? LawyerName { get; set; } 
    public string? LawyerEmail { get; set; } 
    public string? AreaOfPractice { get; set; }
    public string? WorkingDistrict { get; set; } 
    public int Duration { get; set; }
    public decimal BookingAmount { get; set; }
    public decimal PlatformCommission { get; set; }
    public decimal LawyerPayout { get; set; }
    public string BookingStatus { get; set; } 
    public string PaymentStatus { get; set; } 
    public string? TransactionId { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? PaymentVerificationStatus { get; set; }
}