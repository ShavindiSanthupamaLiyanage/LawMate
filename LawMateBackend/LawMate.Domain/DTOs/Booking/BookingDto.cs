using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs.Booking;

public class CreateBookingDto
{
    public string LawyerId { get; set; } = string.Empty;
    public int TimeSlotId { get; set; }
    public string? IssueDescription { get; set; }
}

public class CreateBookingByLawyerDto
{
    public string ClientId { get; set; } = string.Empty;
    public int TimeSlotId { get; set; }
    public DateTime ScheduledDateTime { get; set; }
    public int Duration { get; set; }
    public string? IssueDescription { get; set; }
    public decimal Amount { get; set; }
}

public class UpdateBookingDto
{
    public BookingStatus? BookingStatus { get; set; }
    public DateTime? ScheduledDateTime { get; set; }
    public int? Duration { get; set; }
    public string? IssueDescription { get; set; }
}

public class BookingResponseDto
{
    public int BookingId { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public string LawyerId { get; set; } = string.Empty;
    public string? LawyerName { get; set; }
    public int TimeSlotId { get; set; }
    public DateTime ScheduledDateTime { get; set; }
    public int Duration { get; set; }
    public string? IssueDescription { get; set; }
    public BookingStatus BookingStatus { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
}

public class BookingListResponseDto
{
    public int BookingId { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string? ClientName { get; set; }
    public string LawyerId { get; set; } = string.Empty;
    public string? LawyerName { get; set; }
    public DateTime ScheduledDateTime { get; set; }
    public int Duration { get; set; }
    public BookingStatus BookingStatus { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public decimal Amount { get; set; }
}

