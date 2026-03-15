import { API_CONFIG, ENDPOINTS } from '../config/api.config';
import {StorageService} from "../utils/storage";

const getAuthHeaders = async () => {
    const token = await StorageService.getToken();
    return {
        ...API_CONFIG.HEADERS,
        Authorization: `Bearer ${token}`,
    };
};


export const lawyerVerificationService = {
    accept: async (userId: string): Promise<string> => {
        const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.LAWYER_VERIFICATION.ACCEPT(userId)}`;
        const headers = await getAuthHeaders();

        console.log('[Accept] URL:', url);
        console.log('[Accept] Headers:', headers);

        const response = await fetch(url, {
            method: 'POST',
            headers,
        });

        console.log('[Accept] Status:', response.status);
        console.log('[Accept] Status Text:', response.statusText);

        const rawText = await response.text();
        console.log('[Accept] Raw Response:', rawText);

        if (!response.ok) throw new Error('Failed to accept lawyer');

        return JSON.parse(rawText);
    },

    reject: async (userId: string, reason: string): Promise<string> => {
        const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.LAWYER_VERIFICATION.REJECT(userId)}`;
        const headers = await getAuthHeaders();
        const body = JSON.stringify(reason);

        console.log('[Reject] URL:', url);
        console.log('[Reject] Headers:', headers);
        console.log('[Reject] Body:', body);

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body,
        });

        console.log('[Reject] Status:', response.status);
        console.log('[Reject] Status Text:', response.statusText);

        const rawText = await response.text();
        console.log('[Reject] Raw Response:', rawText);

        if (!response.ok) throw new Error('Failed to accept lawyer');

        return JSON.parse(rawText);
    },
};