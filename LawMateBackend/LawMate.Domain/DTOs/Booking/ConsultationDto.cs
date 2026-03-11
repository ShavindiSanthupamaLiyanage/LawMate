using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs.Booking;

public class UpdateConsultationDto
{
    public ConsultationStatus ConsultationStatus { get; set; }
}

public class ConsultationResponseDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public ConsultationStatus ConsultationStatus { get; set; }
    public bool? IsCompleted { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? CreatedAt { get; set; }
}

