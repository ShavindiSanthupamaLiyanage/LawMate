using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class ClientCreateBookingDto
{
    public string LawyerId        { get; set; } = string.Empty;
    public int TimeSlotId         { get; set; }
    public string ClientName      { get; set; } = string.Empty;
    public string? IssueDescription { get; set; }
    public AppointmentMode Mode   { get; set; }
    public string? Location       { get; set; }
    public PaymentMode PaymentMode { get; set; }
    
    public LegalCategory CaseType   { get; set; }
}