import { API_CONFIG, ENDPOINTS } from '../config/api.config';
import { StorageService } from '../utils/storage';
import {PaymentDetailDto, PaymentDto} from "../interfaces/paymentVerification.interface";

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

const fetchPaymentDetails = async (
    lawyerId: string,
    type: string,
    clientId?: string | null
): Promise<PaymentDetailDto> => {
    const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.GET_DETAILS(lawyerId, type, clientId)}`;
    console.log('[fetchPaymentDetails] GET →', url);

    const headers = await getAuthHeaders();

    let response: Response;
    try {
        response = await fetch(url, { headers });
    } catch (networkError) {
        throw new Error('Network error. Please check your connection.');
    }

    console.log('[fetchPaymentDetails] Status:', response.status);
    const rawText = await response.text();
    console.log('[fetchPaymentDetails] Raw response:', rawText);

    if (!rawText || rawText.trim() === '') {
        throw new Error(`Server returned empty response (HTTP ${response.status})`);
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch payment (HTTP ${response.status}): ${rawText}`);
    }

    try {
        return JSON.parse(rawText);
    } catch {
        throw new Error(`Invalid JSON from server: ${rawText.slice(0, 100)}`);
    }
};

export const paymentVerificationService = {
    getAll:      () => fetchPayments(`${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.ALL}`),
    getPending:  () => fetchPayments(`${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.PENDING}`),
    getApproved: () => fetchPayments(`${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.APPROVED}`),
    getRejected: () => fetchPayments(`${API_CONFIG.BASE_URL}${ENDPOINTS.PAYMENTS.REJECTED}`),
    getDetails:  (lawyerId: string, type: string, clientId?: string | null) =>
        fetchPaymentDetails(lawyerId, type, clientId),
};