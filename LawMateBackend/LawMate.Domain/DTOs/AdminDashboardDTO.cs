using System;
using System.Collections.Generic;

namespace LawMate.Application.AdminModule.AdminDashboard.DTOs
{
    public class AdminDashboardDto
    {
        public int TotalLawyers { get; set; }
        public int TotalClients { get; set; }

        public decimal TotalRevenue { get; set; }
        public decimal ThisMonthRevenue { get; set; }

        public int ActiveMemberships { get; set; }
        public int ExpiredMemberships { get; set; }

        public List<LawyerCategoryDto> LawyerCategories { get; set; }
        public List<MonthlyRevenueDto> MonthlyRevenue { get; set; }

        public List<ActivityDto> RecentActivities { get; set; }
    }

    public class LawyerCategoryDto
    {
        public string Category { get; set; }
        public int Count { get; set; }
    }

    public class MonthlyRevenueDto
    {
        public string Month { get; set; }
        public decimal Revenue { get; set; }
    }

    public class ActivityDto
    {
        public string Name { get; set; }
        public string Action { get; set; }
        public DateTime Time { get; set; }
    }
}