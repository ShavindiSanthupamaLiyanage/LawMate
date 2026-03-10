namespace LawMate.Application.Common.Interfaces.AdminReports;

    public interface ILawyerDetailReportService
    {
        Task<byte[]> GenerateLawyerDetailReportAsync(string generatedByUserId);
    }
