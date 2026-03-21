import { API_CONFIG } from '../config/api.config';
import { StorageService } from '../utils/storage';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface BookingDetailDto {
    bookingId:         number;
    clientName:        string;
    profilePicUrl?:    string | null;
    email:             string;
    phone:             string;
    nic:               string;
    address:           string;
    caseType:          string;
    caseNote?:         string | null;
    createdBy:         string;
    scheduledDateTime: string;   // ISO
    duration:          number;
    paymentMode:       number;
    location?:         string | null;
    status:            number;   // BookingStatus enum int
    rejectionReason?:  string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const BASE = () => `${API_CONFIG.BASE_URL}/lawyer/requests`;

// ─── Service ──────────────────────────────────────────────────────────────────

export const lawyerRequestService = {

    /**
     * GET /api/lawyer/requests/:bookingId
     * Fetches full detail for one booking.
     */
    getById: async (bookingId: number): Promise<BookingDetailDto> => {
        const token = await getToken();
        const res   = await fetch(`${BASE()}/${bookingId}`, {
            method:  'GET',
            headers: buildHeaders(token),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as any)?.message ?? `Failed to load booking (${res.status})`);
        }
        return res.json();
    },

    /**
     * POST /api/lawyer/requests/:bookingId/accept
     */
    accept: async (bookingId: number): Promise<void> => {
        const token = await getToken();
        const res   = await fetch(`${BASE()}/${bookingId}/accept`, {
            method:  'POST',
            headers: buildHeaders(token),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as any)?.message ?? `Accept failed (${res.status})`);
        }
    },

    /**
     * POST /api/lawyer/requests/:bookingId/reject
     * Body: { reason: string }
     */
    reject: async (bookingId: number, reason: string): Promise<void> => {
        const token = await getToken();
        const res   = await fetch(`${BASE()}/${bookingId}/reject`, {
            method:  'POST',
            headers: buildHeaders(token),
            body:    JSON.stringify({ reason }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as any)?.message ?? `Reject failed (${res.status})`);
        }
    },

    /**
     * POST /api/lawyer/requests/:bookingId/cancel
     * Body: { reason: string }
     */
    cancel: async (bookingId: number, reason: string): Promise<void> => {
        const token = await getToken();
        const res   = await fetch(`${BASE()}/${bookingId}/cancel`, {
            method:  'POST',
            headers: buildHeaders(token),
            body:    JSON.stringify({ reason }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as any)?.message ?? `Cancel failed (${res.status})`);
        }
    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps BookingStatus int → display string */
export function statusLabel(status: number): string {
    switch (status) {
        case 0: return 'Pending';
        case 1: return 'Accepted';
        case 2: return 'Verified';
        case 3: return 'Rejected';
        case 4: return 'Suspended';
        case 5: return 'Confirmed';
        case 6: return 'Cancelled';
        default: return 'Pending';
    }
}

/** Maps PaymentMode int → display string */
export function modeLabel(mode: number): string {
    return mode === 1 ? 'Physical' : 'Online';
}