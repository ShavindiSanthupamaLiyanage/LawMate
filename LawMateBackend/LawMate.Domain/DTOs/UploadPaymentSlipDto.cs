// LawMate.Domain/DTOs/UploadPaymentSlipDto.cs

namespace LawMate.Domain.DTOs;

public class UploadPaymentSlipDto
{
    public int BookingId { get; set; }
    public string? TransactionId { get; set; }
    public string SlipNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string SlipImageBase64 { get; set; } = string.Empty;
}