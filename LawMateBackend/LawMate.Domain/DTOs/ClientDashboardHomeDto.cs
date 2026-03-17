namespace LawMate.Domain.DTOs
{
    public class ClientDashboardHomeDto
    {
        public ClientDashboardSummaryDto Summary { get; set; } = new();
        public List<AppointmentBreakdownDto> AppointmentBreakdown { get; set; } = new();
        public List<ClientActivityDto> RecentActivities { get; set; } = new();
    }
}