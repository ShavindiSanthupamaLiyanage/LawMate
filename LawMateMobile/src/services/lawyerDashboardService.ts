import axios from "axios";
import { API_CONFIG, ENDPOINTS } from "../config/api.config";
import { StorageService } from "../utils/storage";

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
   Helpers
------------------------------ */

// Fix 1: Maps all possible BE BookingStatus values -> "Approved" | "Pending"
const mapStatus = (s: string): "Approved" | "Pending" => {
    const approvedStatuses = ["Verified", "Confirmed", "Approved", "Completed"];
    return approvedStatuses.includes(s) ? "Approved" : "Pending";
};

// Fix 2: Prefixes raw base64 string with data URI so RN <Image> can render it
const mapClientImage = (raw: string | null | undefined): string | undefined => {
    if (!raw) return undefined;
    if (raw.startsWith("data:")) return raw;   // already a valid URI, skip
    return `data:image/jpeg;base64,${raw}`;
};

/* -----------------------------
   Service
------------------------------ */
export const LawyerDashboardService = {
    getDashboard: async (lawyerId: string): Promise<LawyerDashboardDto> => {
        const token = await StorageService.getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(
            `${API_CONFIG.BASE_URL}${ENDPOINTS.LAWYER.DASHBOARD}/home`,
            { headers, timeout: API_CONFIG.TIMEOUT }
        );

        const raw = response.data ?? {};

        // Fix 3: Accept both camelCase and PascalCase keys from the BE
        const summaryRaw    = raw.summary              ?? raw.Summary              ?? {};
        const activitiesRaw = raw.recentActivities     ?? raw.RecentActivities     ?? [];
        const breakdownRaw  = raw.appointmentBreakdown ?? raw.AppointmentBreakdown ?? [];

        const summary = {
            totalAppointments: summaryRaw.totalAppointments ?? summaryRaw.TotalAppointments ?? 0,
            totalRevenue:      summaryRaw.totalRevenue      ?? summaryRaw.TotalRevenue      ?? 0,
        };

        const recentActivities: LawyerActivityDto[] = activitiesRaw.map((a: any) => {
            const rawDate = a.filedDate ?? a.FiledDate;
            return {
                title:       a.title      ?? a.Title      ?? "Untitled",
                caseNumber:  a.caseNumber ?? a.CaseNumber ?? "",
                status:      mapStatus(a.status ?? a.Status ?? ""),
                clientName:  a.clientName ?? a.ClientName ?? "",
                filedDate:   rawDate ? new Date(rawDate).toLocaleDateString() : "",
                clientImage: mapClientImage(a.clientImage ?? a.ClientImage),
            };
        });

        const appointmentBreakdown = breakdownRaw.map((b: any) => ({
            category: b.category ?? b.Category ?? "",
            count:    b.count    ?? b.Count    ?? 0,
        }));

        return { summary, appointmentBreakdown, recentActivities };
    },
};
