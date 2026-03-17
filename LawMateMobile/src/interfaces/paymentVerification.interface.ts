export interface PaymentDto {
    paymentId: number | null;
    paymentType: 'Membership' | 'Booking';
    transactionId: string | null;
    lawyerId: string | null;
    clientId: string | null;
    bookingId: number | null;
    amount: number;
    paymentDate: string | null;
    verificationStatus: 0 | 1 | 2; // 0=Pending, 1=Verified, 2=Rejected
    verifiedBy: string | null;
    verifiedAt: string | null;
    rejectionReason: string | null;
}

export interface PaymentDetailDto {
    paymentType: 'Membership' | 'Booking';
    bookingId?: number | null;
    // Lawyer
    lawyerId: string | null;
    lawyerName: string | null;
    lawyerEmail: string | null;

    // Client (only for Booking, null for Membership)
    clientId: string | null;
    clientName: string | null;
    clientEmail: string | null;

    transactionId: string | null;
    amount: number;
    paymentDate: string | null;

    verificationStatus: 0 | 1 | 2;
    verifiedBy: string | null;
    verifiedAt: string | null;
    rejectionReason: string | null;
    receiptDocument: string | null;
}

export interface UpdateMembershipPaymentRequest {
    lawyerId: string | null;
    status: 'Verified' | 'Rejected';
    rejectionReason?: string;
}

export interface UpdateBookingPaymentRequest {
    bookingId: number;
    lawyerId: string | null;
    clientId: string | null;
    status: 'Verified' | 'Rejected';
    rejectionReason?: string;
}