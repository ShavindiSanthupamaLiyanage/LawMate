namespace LawMate.Domain.DTOs;

public class RejectBookingRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class CancelBookingRequest
{
    public string Reason { get; set; } = string.Empty;
}