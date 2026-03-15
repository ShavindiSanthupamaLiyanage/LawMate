import { API_CONFIG, ENDPOINTS } from '../config/api.config';
import { StorageService } from '../utils/storage';

export interface PaymentDto {
    paymentType: 'Membership' | 'Booking';
    transactionId: string | null;
    lawyerId: string | null;
    amount: number;
    paymentDate: string | null;
    verificationStatus: 0 | 1 | 2; // 0=Pending, 1=Verified, 2=Rejected
    verifiedBy: string | null;
    verifiedAt: string | null;
    rejectionReason: string | null;
}

const getAuthHeaders = async () => {
    const token = await StorageService.getToken();
    return { ...API_CONFIG.HEADERS, Authorization: `Bearer ${token}` };
};

const fetchPayments = async (url: string): Promise<PaymentDto[]> => {
    console.log('[fetchPayments] GET →', url);

    const headers = await getAuthHeaders();
    console.log('[fetchPayments] Headers:', headers);

    let response: Response;
    try {
        response = await fetch(url, { headers });
    } catch (networkError) {
        console.error('[fetchPayments] Network error:', networkError);
        throw new Error('Network error. Please check your connection.');
    }

    console.log('[fetchPayments] Status:', response.status);

    const rawText = await response.text();
    console.log('[fetchPayments] Raw response:', rawText);

    if (!response.ok) {
        console.error('[fetchPayments] Request failed:', response.status, rawText);
        throw new Error(`Failed to fetch payments (HTTP ${response.status})`);
    }

    try {
        const json = JSON.parse(rawText);
        console.log('[fetchPayments] Parsed records count:', Array.isArray(json) ? json.length : 'not an array');
        return json;
    } catch {
        console.error('[fetchPayments] Failed to parse JSON:', rawText.slice(0, 200));
        throw new Error('Invalid response format from server');
    }
};

export const paymentService = {
    getAll:      () => { console.log('[paymentService] URL:', `${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.ALL}`);      return fetchPayments(`${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.ALL}`); },
    getPending:  () => { console.log('[paymentService] URL:', `${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.PENDING}`);  return fetchPayments(`${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.PENDING}`); },
    getApproved: () => { console.log('[paymentService] URL:', `${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.APPROVED}`); return fetchPayments(`${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.APPROVED}`); },
    getRejected: () => { console.log('[paymentService] URL:', `${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.REJECTED}`); return fetchPayments(`${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.REJECTED}`); },
};