export interface FinanceDetailsDto {
    lawyerId: string;
    fullName: string;
    nic: string;
    email: string;
    bookingId: number;
    transactionId: string;
    amount: number;
    paymentDate: string;
    verificationStatus: string;
    rejectionReason?: string;
    verifiedBy?: string;
    verifiedAt?: string;
    platformCommission: number;
    lawyerFee: number;
    isPaid: boolean;
    slipNumber?: string;
    receiptDocument?: string;
    contactNumber?: string;
    scheduledDateTime: string;
    duration: number;
}