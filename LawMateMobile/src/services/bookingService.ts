import { API_CONFIG, ENDPOINTS } from '../config/api.config';
import { StorageService } from '../utils/storage';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateBookingRequestDto {
    lawyerId: string;
    timeSlotId: number;
    name: string;
    caseType: number;
    description?: string;
    mode: 'Physical' | 'Online';
    location?: string | null;
    paymentMode?: number;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface CreateBookingResponseDto {
    message: string;
    bookingId: number;
    appointmentId: string;
}

export interface GetAppointmentDto {
    bookingId: number;
    appointmentId: string;
    clientId: string;
    clientName: string;
    email: string;
    contactNumber: string;
    dateTime: string;       // ISO – from BOOKING.ScheduledDateTime
    startTime: string;      // ISO – from TIMESLOT.StartTime
    endTime: string;        // ISO – from TIMESLOT.EndTime
    duration: number;       // minutes
    mode: string;           // "Physical" | "Online"
    price: number;
    paymentStatus: string;
    paymentStatusDisplay: string;
    status: string;         // "Pending" | "Accepted" | "Verified" | "Rejected" | "Suspended" | "Confirmed" | "Cancelled"
    notes?: string;
    caseType: string;       // "Family Law" | "Criminal Law" | "Property Law" | "Cyber" | "General"
    rejectionReason?: string;
}

export interface BookingDetailDto {
    bookingId: number;
    appointmentId: string;
    lawyerId: string;
    clientId: string;
    scheduledDateTime: string;
    endTime: string;
    duration: number;
    issueDescription: string;
    bookingStatus: string;
    amount: number;
    paymentStatus: string;
    mode: string;
    location?: string;
}

export interface TimeSlotDto {
    timeSlotId: number;
    id: string;
    lawyerId: string;
    startTime: string;    // ISO 8601
    endTime: string;      // ISO 8601
    isAvailable: boolean;
    bookedBy?: string;
    bookingId?: number;
    booked: boolean;
    date: string;
    duration: number;
    price: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = async (): Promise<string> => {
    const token = await StorageService.getToken();
    if (!token) throw new Error('Session expired. Please log in again.');
    return token;
};

const buildHeaders = (token: string) => ({
    ...API_CONFIG.HEADERS,
    Authorization: `Bearer ${token}`,
});

// ─── Service ──────────────────────────────────────────────────────────────────

export const bookingService = {

    /**
     * GET /api/availability/slots/:slotId
     * Fetches a single time slot to auto-fill date/time in AppointmentForm.
     */
    getTimeSlot: async (slotId: number): Promise<TimeSlotDto> => {
        const token = await getToken();
        const url   = `${API_CONFIG.BASE_URL}${ENDPOINTS.AVAILABILITY.GET_SLOT_BY_ID(slotId)}`;

        const response = await fetch(url, {
            method:  'GET',
            headers: buildHeaders(token),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(
                (err as any)?.message ?? `Get slot failed (${response.status})`,
            );
        }

        return response.json() as Promise<TimeSlotDto>;
    },

    /**
     * POST /api/bookings
     * Creates a new appointment booking. Date/time/duration derived from slot on backend.
     */
    createBooking: async (
        payload: CreateBookingRequestDto,
    ): Promise<CreateBookingResponseDto> => {
        const token = await getToken();
        const url   = `${API_CONFIG.BASE_URL}${ENDPOINTS.BOOKING.CREATE}`;

        const response = await fetch(url, {
            method:  'POST',
            headers: buildHeaders(token),
            body: JSON.stringify({
                lawyerId:         payload.lawyerId,
                timeSlotId:       payload.timeSlotId,
                clientName:       payload.name,
                caseType:         payload.caseType,
                issueDescription: payload.description ?? null,
                mode:             payload.mode === 'Physical' ? 1 : 0,
                location:         payload.mode === 'Physical' ? (payload.location ?? null) : null,
                paymentMode:      payload.paymentMode ?? 0,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(
                (err as any)?.message ?? `Create booking failed (${response.status})`,
            );
        }

        return response.json() as Promise<CreateBookingResponseDto>;
    },

    /**
     * GET /api/bookings/:bookingId
     */
    getBookingById: async (bookingId: number): Promise<GetAppointmentDto> => {
        const token = await getToken();
        const url   = `${API_CONFIG.BASE_URL}${ENDPOINTS.BOOKING.GET_BY_ID(bookingId)}`;

        const response = await fetch(url, {
            method:  'GET',
            headers: buildHeaders(token),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(
                (err as any)?.message ?? `Get booking failed (${response.status})`,
            );
        }

        return response.json() as Promise<GetAppointmentDto>;
    },

    /**
     * GET /api/bookings/lawyer/:lawyerId
     */
    getLawyerAppointments: async (
        lawyerId: string,
        startDate?: Date,
        endDate?: Date,
    ): Promise<GetAppointmentDto[]> => {
        const token = await getToken();
        let url     = `${API_CONFIG.BASE_URL}${ENDPOINTS.BOOKING.GET_LAWYER_APPOINTMENTS(lawyerId)}`;

        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate)   params.append('endDate',   endDate.toISOString());
        if ([...params].length) url += `?${params.toString()}`;

        const response = await fetch(url, {
            method:  'GET',
            headers: buildHeaders(token),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(
                (err as any)?.message ?? `Get appointments failed (${response.status})`,
            );
        }

        return response.json() as Promise<GetAppointmentDto[]>;
    },

    /**
     * GET /api/client/appointments
     * Returns all bookings for the currently authenticated client (token-based).
     */
    getClientAppointments: async (): Promise<GetAppointmentDto[]> => {
        const token = await getToken();
        const url   = `${API_CONFIG.BASE_URL}${ENDPOINTS.CLIENT.APPOINTMENTS}`;

        const response = await fetch(url, {
            method:  'GET',
            headers: buildHeaders(token),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(
                (err as any)?.message ?? `Get client appointments failed (${response.status})`,
            );
        }

        return response.json() as Promise<GetAppointmentDto[]>;
    },

    /**
     * PATCH /api/bookings/:bookingId/status
     */
    updateBookingStatus: async (
        bookingId: number,
        status: string,
        rejectionReason?: string,
    ): Promise<void> => {
        const token = await getToken();
        const url   = `${API_CONFIG.BASE_URL}${ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId)}`;

        const response = await fetch(url, {
            method:  'PATCH',
            headers: buildHeaders(token),
            body: JSON.stringify({
                status,
                rejectionReason: rejectionReason ?? null,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(
                (err as any)?.message ?? `Update status failed (${response.status})`,
            );
        }
    },
};