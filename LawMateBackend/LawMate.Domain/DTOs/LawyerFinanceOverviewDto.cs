namespace LawMate.Domain.DTOs;

public class LawyerFinanceOverviewDto
{
    public decimal TotalEarnings { get; set; }
    public decimal ThisMonth { get; set; }
    public decimal PendingVerification { get; set; }
    public decimal TransferredToBank { get; set; }
}