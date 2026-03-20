import axios from "axios";
import { API_CONFIG, ENDPOINTS } from "../config/api.config";

/* -----------------------------
   Types
------------------------------ */
export type DonutItem = { label: string; value: number; color: string };

export type LawyerActivityDto = {
    title: string;
    caseNumber: string;
    status: "Approved" | "Pending";
    clientName: string;
    filedDate: string;
    clientImage?: string;
};

export type LawyerDashboardDto = {
    summary: {
        totalAppointments: number;
        totalRevenue: number;
    };
    appointmentBreakdown: { category: string; count: number }[];
    recentActivities: LawyerActivityDto[];
};

/* -----------------------------
   Service
------------------------------ */
export const LawyerDashboardService = {
    getDashboard: async (lawyerId: string): Promise<LawyerDashboardDto> => {
        const response = await axios.get(`${API_CONFIG.BASE_URL}${ENDPOINTS.LAWYER_FINANCE.DASHBOARD}?lawyerId=${lawyerId}`, {
            headers: API_CONFIG.HEADERS,
            timeout: API_CONFIG.TIMEOUT,
        });
        return response.data;
    },
};