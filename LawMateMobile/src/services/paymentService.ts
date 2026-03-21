import { API_CONFIG } from '../config/api.config';
import { StorageService } from '../utils/storage';

const getToken = async (): Promise<string> => {
    const token = await StorageService.getToken();
    if (!token) throw new Error('Session expired. Please log in again.');
    return token;
};

const buildHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Accept:         'application/json',
    Authorization:  `Bearer ${token}`,
});

export interface PaymentSlipResultDto {
    paymentId:          number;
    slipImageBase64:    string;
    verificationStatus: string;   // "Pending" | "Verified" | "Rejected"
    createdAt:          string;
}

export const paymentService = {

    /**
     * POST /api/client/payment/upload-slip
     * Body: { bookingId, slipImageBase64 }
     */
    uploadPaymentSlip: async (
        bookingId: number,
        slipImageBase64: string,
    ): Promise<{ paymentId: number; message: string }> => {
        const token = await getToken();
        const url   = `${API_CONFIG.BASE_URL}/client/payment/upload-slip`;

        const response = await fetch(url, {
            method:  'POST',
            headers: buildHeaders(token),
            body:    JSON.stringify({ bookingId, slipImageBase64 }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error((err as any)?.message ?? `Upload failed (${response.status})`);
        }

        return response.json();
    },

    /**
     * GET /api/client/payment/slip/:bookingId
     * Returns the uploaded slip image (base64) for a booking.
     */
    getPaymentSlip: async (
        bookingId: number,
    ): Promise<PaymentSlipResultDto | null> => {
        const token = await getToken();
        const url   = `${API_CONFIG.BASE_URL}/client/payment/slip/${bookingId}`;

        const response = await fetch(url, {
            method:  'GET',
            headers: buildHeaders(token),
        });

        if (response.status === 404) return null;  // no slip uploaded yet

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error((err as any)?.message ?? `Get slip failed (${response.status})`);
        }

        return response.json();
    },
};