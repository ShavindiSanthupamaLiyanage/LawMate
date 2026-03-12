namespace LawMate.Application.Common.Interfaces.AdminReports;

public interface IClientDetailReportService
{
    Task<byte[]> GenerateClientDetailReportAsync(string generatedByUserId);
}