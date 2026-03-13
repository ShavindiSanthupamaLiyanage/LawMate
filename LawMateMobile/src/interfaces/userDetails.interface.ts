export interface UserCountsDto {
    verifiedLawyers: number;
    pendingLawyers: number;
    inactiveLawyers: number;
    activeLawyers: number;
    activeClients: number;
    inactiveClients: number;
}

export interface LawyerVerificationListDto {
    userId: string;
    lawyerName: string;
    sceCertificateNo: string;
    barAssociationRegNo: string;
    verificationStatus: number; // 0=Pending, 1=Active, 2=Rejected
    profileImage: string | null;
}