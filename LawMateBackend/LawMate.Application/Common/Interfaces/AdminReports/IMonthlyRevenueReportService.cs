namespace LawMate.Application.Common.Interfaces.AdminReports;

public interface IMonthlyRevenueReportService
{
    Task<byte[]> GenerateMonthlyRevenueReportAsync(string generatedByUserId);
}