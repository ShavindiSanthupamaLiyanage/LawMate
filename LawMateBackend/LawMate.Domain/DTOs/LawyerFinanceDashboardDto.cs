namespace LawMate.Domain.DTOs;

public class LawyerFinanceDashboardDto
{
    public decimal TotalEarnings { get; set; }
    public decimal ThisMonth { get; set; }
    public decimal PendingVerification { get; set; }
    public decimal TransferredToBank { get; set; }

    public List<LawyerFinanceTransactionItemDto> RecentTransactions { get; set; } = new();
}