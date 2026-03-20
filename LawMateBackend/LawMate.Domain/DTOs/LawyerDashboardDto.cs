namespace LawMate.Domain.DTOs.Lawyer
{
    public class LawyerDashboardDto
    {
        public LawyerDashboardSummaryDto Summary { get; set; }
        public List<AppointmentBreakdownDto> AppointmentBreakdown { get; set; }
        public List<LawyerActivityDto> RecentActivities { get; set; }
    }

    public class LawyerDashboardSummaryDto
    {
        public int TotalAppointments { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}