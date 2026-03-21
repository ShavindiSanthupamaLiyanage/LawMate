import { API_CONFIG, ENDPOINTS } from '../config/api.config';
import { StorageService } from '../utils/storage';

const getToken = async (): Promise<string> => {
    const token = await StorageService.getToken();
    if (!token) throw new Error('Session expired. Please log in again.');
    return token;
};

const buildHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
});

export const clientBookingService = {

    /**
     * POST /api/client/appointments/:bookingId/cancel
     * Client cancels their own booking with a reason.
     */
    cancelBooking: async (bookingId: number, reason: string): Promise<void> => {
        const token = await getToken();
        const url   = `${API_CONFIG.BASE_URL}/client/appointments/${bookingId}/cancel`;

        const response = await fetch(url, {
            method:  'POST',
            headers: buildHeaders(token),
            body:    JSON.stringify({ reason }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(
                (err as any)?.message ?? `Cancel failed (${response.status})`,
            );
        }
    },
};