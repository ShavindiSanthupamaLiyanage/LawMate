namespace LawMate.Domain.DTOs;

public class MonthlyRevenueReportDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string? MonthName { get; set; } 

    public int TotalBookings { get; set; }
    public int CompletedBookings { get; set; }
    public int CancelledBookings { get; set; }

    public decimal TotalRevenue { get; set; }
    public decimal PendingRevenue { get; set; }
    public decimal MembershipRevenue { get; set; }

    public int NewClients { get; set; }
    public int NewLawyers { get; set; }
}