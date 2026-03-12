
export enum BookingStatus {
    Pending = 'Pending',
    Accepted = 'Accepted', 
    Verified = 'Verified',
    Rejected = 'Rejected',
    Suspended = 'Suspended',
}

export enum PaymentStatus {
    Pending = 'Pending',
    Paid = 'Paid',
    Refunded = 'Refunded',
    Failed = 'Failed',
}

export interface AppointmentDto {
    bookingId: number;
    appointmentId: string; 
    clientId: string;
    clientName: string;
    email: string;
    contactNumber?: string;
    caseType: string;
    dateTime: string; 
    duration: number; 
    status: BookingStatus;
    mode: string;
    price: number;
    notes?: string;
    paymentStatus: PaymentStatus;
    paymentStatusDisplay: string;
}

export interface AvailabilitySlotDto {
    timeSlotId: number;
    id: string;
    date: string; // ISO date string
    startTime: string; // "HH:mm"
    price: number;
    duration: number; // minutes
    booked: boolean;
    bookedBy?: string;
    bookingId?: number;
}

export interface CreateManualBookingRequest {
    lawyerId: string;
    clientEmail: string;
    clientName: string;
    contactNumber?: string;
    caseType: string;
    dateTime: string; // ISO date string
    duration: number;
    price: number;
    mode: string; // "Physical" or "Virtual"
    notes?: string;
    timeSlotId?: number;
}

export interface CreateAvailabilitySlotRequest {
    lawyerId: string;
    date: string; // ISO date string
    startTime: string; // "HH:mm"
    duration: number;
    price: number;
}

export interface UpdateAvailabilitySlotRequest {
    date?: string;
    startTime?: string;
    duration?: number;
    price?: number;
}

export interface UpdateBookingStatusRequest {
    status: BookingStatus;
    rejectionReason?: string;
}

export interface CreateBookingResponse {
    message: string;
    bookingId: number;
    appointmentId: string;
}

export interface CreateSlotResponse {
    message: string;
    timeSlotId: number;
    id: string;
}
