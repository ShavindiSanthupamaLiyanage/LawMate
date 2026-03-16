using System.ComponentModel.DataAnnotations;

namespace LawMate.Domain.DTOs;

public class SubmitBookingPaymentDto
{
    [Required]
    public DateTime PaymentDate { get; set; }

    [Required]
    [MaxLength(100)]
    public string SlipNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? TransactionId { get; set; }
}