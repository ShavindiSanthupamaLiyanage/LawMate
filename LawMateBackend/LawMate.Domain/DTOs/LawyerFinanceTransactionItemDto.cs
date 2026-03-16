namespace LawMate.Domain.DTOs;

public class LawyerFinanceTransactionItemDto
{
    public int PaymentId { get; set; }
    public int BookingId { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string ClientDisplay { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime TransactionDate { get; set; }
    public string Status { get; set; } = string.Empty;
}