namespace LawMate.Application.Common.Interfaces.AdminReports;

public interface IFinancialSummaryReportService
{
    Task<byte[]> GenerateFinancialSummaryReportAsync(string generatedByUserId);
}