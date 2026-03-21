import apiClient from '../api/httpClient';
import { ENDPOINTS } from '../config/api.config';

// ─── What the backend actually returns (GetAvailabilitySlotDto) ───────────────

interface GetAvailabilitySlotDto {
    timeSlotId:   number;
    id:           string;
    lawyerId:     string;
    date:         string;
    startTime:    string;   // full ISO 8601
    endTime:      string;   // full ISO 8601
    isAvailable:  boolean;
    price:        number;
    duration:     number;
    booked:       boolean;
    bookedBy?:    string;
    bookingId?:   number;
}

// ─── What the screen components use ──────────────────────────────────────────

export interface TimeSlotDto {
    timeSlotId:   number;
    lawyerId:     string;
    startTime:    string;   // full ISO 8601
    endTime:      string;   // full ISO 8601
    isAvailable:  boolean;
    bookedBy?:    string;
}

export interface LawyerProfileDto {
    lawyerId:                 string;
    fullName:                 string;
    profileImageBase64?:      string;
    areaOfPractice:           string;
    professionalDesignation?: string;
    yearOfExperience:         number;
    averageRating:            number;
    officeContactNumber?:     string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AppointmentRequestService {

    static async getLawyerProfile(lawyerId: string): Promise<LawyerProfileDto> {
        const response = await apiClient.get<LawyerProfileDto>(
            ENDPOINTS.LAWYER.GET_PROFILE(lawyerId)
        );
        return response.data;
    }

    static async getAvailableSlots(
        lawyerId:   string,
        startDate?: Date,
        endDate?:   Date
    ): Promise<TimeSlotDto[]> {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate.toISOString();
        if (endDate)   params.endDate   = endDate.toISOString();

        const response = await apiClient.get<GetAvailabilitySlotDto[]>(
            ENDPOINTS.AVAILABILITY.GET_LAWYER_SLOTS(lawyerId),
            { params }
        );

        // Map GetAvailabilitySlotDto → TimeSlotDto
        // No client-side isAvailable filter needed — backend already filters
        return response.data.map((s) => ({
            timeSlotId:  s.timeSlotId,
            lawyerId:    s.lawyerId,
            startTime:   s.startTime,
            endTime:     s.endTime,
            isAvailable: s.isAvailable,
            bookedBy:    s.bookedBy,
        }));
    }
}