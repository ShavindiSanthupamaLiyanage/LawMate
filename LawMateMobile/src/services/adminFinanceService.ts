import { API_CONFIG, ENDPOINTS } from '../config/api.config';
import { StorageService } from '../utils/storage';
import { FinanceDetailsDto } from '../interfaces/adminFinance.interface';

export const AdminFinanceService = {
    getAllFinanceDetails: async (): Promise<FinanceDetailsDto[]> => {
        const token = await StorageService.getToken();
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${ENDPOINTS.ADMIN_FINANCE.ALL_FINANCE_DETAILS}`,
            {
                method: 'GET',
                headers: {
                    ...API_CONFIG.HEADERS,
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!response.ok) throw new Error('Failed to fetch finance details');
        return response.json();
    },

    approveFinance: async (bookingId: number, slipNo: string): Promise<string> => {
        const token = await StorageService.getToken();
        const response = await fetch(
            `${API_CONFIG.BASE_URL}/admin/finance/approve/${bookingId}?slipNo=${encodeURIComponent(slipNo)}`,
            {
                method: 'POST',
                headers: {
                    ...API_CONFIG.HEADERS,
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!response.ok) throw new Error('Failed to approve payment');
        return response.text();
    },
};