export interface LawyerCategoryDto {
    category: string;
    count: number;
}

export interface MonthlyRevenueDto {
    month: string;
    revenue: number;
}

export interface ActivityDto {
    name: string;
    action: string;
    time: string; // ISO date string from backend
}

export interface AdminDashboardDto {
    totalLawyers: number;
    totalClients: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    activeMemberships: number;
    expiredMemberships: number;
    lawyerCategories: LawyerCategoryDto[];
    monthlyRevenue: MonthlyRevenueDto[];
    recentActivities: ActivityDto[];
}