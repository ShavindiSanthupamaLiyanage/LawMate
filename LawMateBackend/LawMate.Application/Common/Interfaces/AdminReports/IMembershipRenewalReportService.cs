namespace LawMate.Application.Common.Interfaces.AdminReports;

public interface IMembershipRenewalReportService
{
    Task<byte[]> GenerateMembershipRenewalReportAsync(string generatedByUserId);
}