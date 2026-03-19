import apiClient from "../api/httpClient";
import { ENDPOINTS } from "../config/api.config";
import {
    LawyerFinanceDashboardDto,
    LawyerFinanceTransactionItemDto,
    LawyerEarningsReportDto,
} from "../interfaces/lawyerFinance.interface";

export class LawyerFinanceService {

    static async getDashboard(): Promise<LawyerFinanceDashboardDto> {
        const response = await apiClient.get(ENDPOINTS.LAWYER_FINANCE.DASHBOARD);
        return response.data;
    }

    static async getTransactions(
        search?: string,
        status?: "Verified" | "Pending" | "Rejected"
    ): Promise<LawyerFinanceTransactionItemDto[]> {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;

        const response = await apiClient.get(ENDPOINTS.LAWYER_FINANCE.TRANSACTIONS, { params });
        return response.data;
    }

    static async getReport(options?: {
        preset?: "thisweek" | "thismonth" | "lastmonth";
        startDate?: Date;
        endDate?: Date;
    }): Promise<LawyerEarningsReportDto> {
        const params: Record<string, string> = {};
        if (options?.preset) params.preset = options.preset;
        if (options?.startDate) params.startDate = options.startDate.toISOString();
        if (options?.endDate) params.endDate = options.endDate.toISOString();

        const response = await apiClient.get(ENDPOINTS.LAWYER_FINANCE.REPORT, { params });
        return response.data;
    }
}