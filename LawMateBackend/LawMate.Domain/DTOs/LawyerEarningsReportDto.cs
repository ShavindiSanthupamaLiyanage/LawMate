namespace LawMate.Domain.DTOs;

public class LawyerEarningsReportDto
{
    public int TotalSessions { get; set; }
    public decimal TotalEarnings { get; set; }
    public decimal VerifiedAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public decimal TransferredAmount { get; set; }
    public List<LawyerTopClientIncomeDto> TopClients { get; set; } = new();
}