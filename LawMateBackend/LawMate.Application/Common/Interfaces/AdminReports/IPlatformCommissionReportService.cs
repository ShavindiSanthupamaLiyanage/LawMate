namespace LawMate.Application.Common.Interfaces.AdminReports;

public interface IPlatformCommissionReportService
{
    Task<byte[]> GeneratePlatformCommissionReportAsync(string generatedByUserId);
}