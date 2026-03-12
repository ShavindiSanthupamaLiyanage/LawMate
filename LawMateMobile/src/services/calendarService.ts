import apiClient from '../api/client';
import {
    AppointmentDto,
    AvailabilitySlotDto,
    CreateManualBookingRequest,
    CreateAvailabilitySlotRequest,
    UpdateAvailabilitySlotRequest,
    UpdateBookingStatusRequest,
    CreateBookingResponse,
    CreateSlotResponse,
} from '../interfaces/calendar.interface';
import { ENDPOINTS } from '../config/api.config';

/**
 * Calendar Service
 * Handles all calendar, booking, and availability API calls
 */

// ===== APPOINTMENTS/BOOKINGS =====

/**
 * Fetch all appointments for a lawyer with optional date filtering
 */
export const getLawyerAppointments = async (
    lawyerId: string,
    startDate?: Date,
    endDate?: Date
): Promise<AppointmentDto[]> => {
    try {
        const params = new URLSearchParams();
        if (startDate) {
            params.append('startDate', startDate.toISOString());
        }
        if (endDate) {
            params.append('endDate', endDate.toISOString());
        }

        const queryString = params.toString();
        const url = queryString 
            ? `${ENDPOINTS.BOOKING.GET_LAWYER_APPOINTMENTS(lawyerId)}?${queryString}`
            : ENDPOINTS.BOOKING.GET_LAWYER_APPOINTMENTS(lawyerId);

        const response = await apiClient.get<AppointmentDto[]>(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching lawyer appointments:', error);
        throw error;
    }
};

/**
 * Get a specific appointment by ID
 */
export const getAppointmentById = async (
    bookingId: number
): Promise<AppointmentDto> => {
    try {
        const response = await apiClient.get<AppointmentDto>(
            ENDPOINTS.BOOKING.GET_BY_ID(bookingId)
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching appointment:', error);
        throw error;
    }
};

/**
 * Create a manual appointment (lawyer-initiated)
 */
export const createManualBooking = async (
    request: CreateManualBookingRequest
): Promise<CreateBookingResponse> => {
    try {
        const response = await apiClient.post<CreateBookingResponse>(
            ENDPOINTS.BOOKING.CREATE,
            request
        );
        return response.data;
    } catch (error) {
        console.error('Error creating manual booking:', error);
        throw error;
    }
};

/**
 * Update appointment status
 */
export const updateBookingStatus = async (
    bookingId: number,
    request: UpdateBookingStatusRequest
): Promise<void> => {
    try {
        await apiClient.patch(
            ENDPOINTS.BOOKING.UPDATE_STATUS(bookingId),
            request
        );
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error;
    }
};

// ===== AVAILABILITY SLOTS =====

/**
 * Fetch all availability slots for a lawyer with optional date filtering
 */
export const getLawyerAvailabilitySlots = async (
    lawyerId: string,
    startDate?: Date,
    endDate?: Date
): Promise<AvailabilitySlotDto[]> => {
    try {
        const params = new URLSearchParams();
        if (startDate) {
            params.append('startDate', startDate.toISOString());
        }
        if (endDate) {
            params.append('endDate', endDate.toISOString());
        }

        const queryString = params.toString();
        const url = queryString
            ? `${ENDPOINTS.AVAILABILITY.GET_LAWYER_SLOTS(lawyerId)}?${queryString}`
            : ENDPOINTS.AVAILABILITY.GET_LAWYER_SLOTS(lawyerId);

        const response = await apiClient.get<AvailabilitySlotDto[]>(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching availability slots:', error);
        throw error;
    }
};

/**
 * Create a new availability slot
 */
export const createAvailabilitySlot = async (
    request: CreateAvailabilitySlotRequest
): Promise<CreateSlotResponse> => {
    try {
        const response = await apiClient.post<CreateSlotResponse>(
            ENDPOINTS.AVAILABILITY.CREATE,
            request
        );
        return response.data;
    } catch (error) {
        console.error('Error creating availability slot:', error);
        throw error;
    }
};

/**
 * Update an existing availability slot
 */
export const updateAvailabilitySlot = async (
    slotId: number,
    request: UpdateAvailabilitySlotRequest
): Promise<void> => {
    try {
        await apiClient.put(
            ENDPOINTS.AVAILABILITY.UPDATE(slotId),
            request
        );
    } catch (error) {
        console.error('Error updating availability slot:', error);
        throw error;
    }
};

/**
 * Delete an availability slot (only if not booked)
 */
export const deleteAvailabilitySlot = async (
    slotId: number
): Promise<void> => {
    try {
        await apiClient.delete(ENDPOINTS.AVAILABILITY.DELETE(slotId));
    } catch (error) {
        console.error('Error deleting availability slot:', error);
        throw error;
    }
};
