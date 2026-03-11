import apiClient from '../api/client';
import { ENDPOINTS } from '../config/api.config';
import { Appointment, AvailabilitySlot } from '../screens/lawyer/lawyerCalender/CalendarComponent';

/**
 * CalendarService
 * Handles all calendar, appointment, and availability slot related API calls
 */
export class CalendarService {

    /**
     * Fetch all appointments for the logged-in lawyer
     * @returns Array of appointments
     * @throws Error if fetch fails
     */
    static async getAppointments(): Promise<Appointment[]> {
        try {
            console.log('Fetching lawyer appointments...');

            const response = await apiClient.get<Appointment[]>(
                ENDPOINTS.LAWYER.APPOINTMENTS
            );

            console.log('Appointments fetched successfully:', response.data?.length ?? 0);
            return response.data || [];
        } catch (error: any) {
            console.error('Failed to fetch appointments:', error.message);
            throw error;
        }
    }

    /**
     * Fetch a specific appointment by ID
     * @param appointmentId - The appointment ID
     * @returns Appointment details
     * @throws Error if fetch fails
     */
    static async getAppointmentDetail(appointmentId: string): Promise<Appointment> {
        try {
            console.log('🔍 Fetching appointment details:', appointmentId);

            const response = await apiClient.get<Appointment>(
                `${ENDPOINTS.LAWYER.APPOINTMENTS}/${appointmentId}`
            );

            console.log('Appointment details fetched');
            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch appointment detail:', error.message);
            throw error;
        }
    }

    /**
     * Create a new appointment (Lawyer creates appointment for client)
     * @param appointmentData - Appointment details
     * @returns Created appointment
     * @throws Error if creation fails
     */
    static async createAppointment(appointmentData: Omit<Appointment, 'id' | 'appointmentId'>): Promise<Appointment> {
        try {
            console.log('Creating new appointment...');

            const response = await apiClient.post<Appointment>(
                ENDPOINTS.LAWYER.APPOINTMENTS,
                appointmentData
            );

            console.log('Appointment created successfully:', response.data?.id);
            return response.data;
        } catch (error: any) {
            console.error('Failed to create appointment:', error.message);
            throw error;
        }
    }

    /**
     * Update an existing appointment
     * @param appointmentId - The appointment ID
     * @param updates - Fields to update
     * @returns Updated appointment
     * @throws Error if update fails
     */
    static async updateAppointment(
        appointmentId: string,
        updates: Partial<Appointment>
    ): Promise<Appointment> {
        try {
            console.log('Updating appointment:', appointmentId);

            const response = await apiClient.patch<Appointment>(
                `${ENDPOINTS.LAWYER.APPOINTMENTS}/${appointmentId}`,
                updates
            );

            console.log('Appointment updated successfully');
            return response.data;
        } catch (error: any) {
            console.error('Failed to update appointment:', error.message);
            throw error;
        }
    }

    /**
     * Cancel/Delete an appointment
     * @param appointmentId - The appointment ID
     * @returns Success message
     * @throws Error if deletion fails
     */
    static async deleteAppointment(appointmentId: string): Promise<{ message: string }> {
        try {
            console.log('Deleting appointment:', appointmentId);

            const response = await apiClient.delete<{ message: string }>(
                `${ENDPOINTS.LAWYER.APPOINTMENTS}/${appointmentId}`
            );

            console.log('Appointment deleted successfully');
            return response.data;
        } catch (error: any) {
            console.error('Failed to delete appointment:', error.message);
            throw error;
        }
    }

    /**
     * Fetch availability slots for the logged-in lawyer
     * @param month - Optional: Month (1-12)
     * @param year - Optional: Year
     * @returns Array of availability slots
     * @throws Error if fetch fails
     */
    static async getAvailabilitySlots(month?: number, year?: number): Promise<AvailabilitySlot[]> {
        try {
            console.log('Fetching availability slots...');

            let url = '/lawyer/availability';
            if (month && year) {
                url += `?month=${month}&year=${year}`;
            }

            const response = await apiClient.get<AvailabilitySlot[]>(url);

            console.log('Availability slots fetched successfully:', response.data?.length ?? 0);
            return response.data || [];
        } catch (error: any) {
            console.error('Failed to fetch availability slots:', error.message);
            throw error;
        }
    }

    /**
     * Create a new availability slot
     * @param slotData - Slot details
     * @returns Created slot
     * @throws Error if creation fails
     */
    static async createAvailabilitySlot(
        slotData: Omit<AvailabilitySlot, 'id'>
    ): Promise<AvailabilitySlot> {
        try {
            console.log('Creating availability slot...');

            const response = await apiClient.post<AvailabilitySlot>(
                '/lawyer/availability',
                slotData
            );

            console.log('Availability slot created:', response.data?.id);
            return response.data;
        } catch (error: any) {
            console.error('Failed to create availability slot:', error.message);
            throw error;
        }
    }

    /**
     * Update an existing availability slot
     * @param slotId - The slot ID
     * @param updates - Fields to update
     * @returns Updated slot
     * @throws Error if update fails
     */
    static async updateAvailabilitySlot(
        slotId: string,
        updates: Partial<AvailabilitySlot>
    ): Promise<AvailabilitySlot> {
        try {
            console.log('Updating availability slot:', slotId);

            const response = await apiClient.patch<AvailabilitySlot>(
                `/lawyer/availability/${slotId}`,
                updates
            );

            console.log('Availability slot updated');
            return response.data;
        } catch (error: any) {
            console.error('Failed to update availability slot:', error.message);
            throw error;
        }
    }

    /**
     * Delete an availability slot
     * @param slotId - The slot ID
     * @returns Success message
     * @throws Error if deletion fails
     */
    static async deleteAvailabilitySlot(slotId: string): Promise<{ message: string }> {
        try {
            console.log('Deleting availability slot:', slotId);

            const response = await apiClient.delete<{ message: string }>(
                `/lawyer/availability/${slotId}`
            );

            console.log('Availability slot deleted');
            return response.data;
        } catch (error: any) {
            console.error('Failed to delete availability slot:', error.message);
            throw error;
        }
    }

    /**
     * Verify appointment payment
     * @param bookingId - The booking ID
     * @returns Payment verification result
     * @throws Error if verification fails
     */
    static async verifyPayment(bookingId: string): Promise<{ status: string; message: string }> {
        try {
            console.log('Verifying payment for booking:', bookingId);

            const response = await apiClient.post<{ status: string; message: string }>(
                '/payment/verify',
                { bookingId }
            );

            console.log('Payment verified');
            return response.data;
        } catch (error: any) {
            console.error('Failed to verify payment:', error.message);
            throw error;
        }
    }

    /**
     * Get payment status for an appointment
     * @param appointmentId - The appointment ID
     * @returns Payment status
     * @throws Error if fetch fails
     */
    static async getPaymentStatus(appointmentId: string): Promise<{ status: string; amount: number }> {
        try {
            console.log('🔍 Fetching payment status for appointment:', appointmentId);

            const response = await apiClient.get<{ status: string; amount: number }>(
                `/appointments/${appointmentId}/payment`
            );

            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch payment status:', error.message);
            throw error;
        }
    }

    /**
     * Update consultation status
     * @param appointmentId - The appointment ID
     * @param status - New consultation status (scheduled, ongoing, finished, cancelled)
     * @returns Updated consultation
     * @throws Error if update fails
     */
    static async updateConsultationStatus(
        appointmentId: string,
        status: 'scheduled' | 'ongoing' | 'finished' | 'cancelled'
    ): Promise<{ message: string; status: string }> {
        try {
            console.log('Updating consultation status:', appointmentId, '->', status);

            const response = await apiClient.patch<{ message: string; status: string }>(
                `/consultation/${appointmentId}`,
                { status }
            );

            console.log('Consultation status updated');
            return response.data;
        } catch (error: any) {
            console.error('Failed to update consultation status:', error.message);
            throw error;
        }
    }

    /**
     * Mark consultation as completed
     * @param appointmentId - The appointment ID
     * @returns Success message
     * @throws Error if operation fails
     */
    static async completeConsultation(appointmentId: string): Promise<{ message: string }> {
        try {
            console.log('Marking consultation as completed:', appointmentId);

            const response = await apiClient.post<{ message: string }>(
                `/consultation/${appointmentId}/complete`,
                {}
            );

            console.log('Consultation marked as completed');
            return response.data;
        } catch (error: any) {
            console.error('Failed to complete consultation:', error.message);
            throw error;
        }
    }
}
