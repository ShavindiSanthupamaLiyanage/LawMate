namespace LawMate.Domain.DTOs;

public class FinancialSummaryReportDto
{
    public int TotalBookings { get; set; }
    public decimal TotalBookingRevenue { get; set; }
    public decimal PendingBookingRevenue { get; set; }

    public int TotalMemberships { get; set; }
    public decimal TotalMembershipRevenue { get; set; }
    public int ActiveMemberships { get; set; }

    public int TotalClients { get; set; }
    public int TotalLawyers { get; set; }
    public int VerifiedLawyers { get; set; }

    public int CompletedConsultations { get; set; }
    public int OngoingConsultations { get; set; }

    public decimal ThisMonthBookingRevenue { get; set; }
    public decimal ThisMonthMembershipRevenue { get; set; }
}