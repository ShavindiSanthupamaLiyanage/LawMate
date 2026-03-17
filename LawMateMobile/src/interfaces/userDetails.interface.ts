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

export interface GetClientDto {
    userId:            string;
    prefix:            number;
    firstName:         string;
    lastName:          string;
    nic:               string;
    email:             string;
    gender:            number;
    dateOfBirth?:      string;
    nationality?:      string;
    contactNumber:     string;
    state:             number;
    registrationDate:  string;
    profileImage:      string | null;
    address:           string;
    district:          string;
    prefferedLanguage: number;
}

export interface GetLawyerDto {
    userId: string;
    prefix: number;
    firstName: string;
    lastName: string;
    userName?: string;
    email?: string;
    nic?: string;
    contactNumber?: string;
    gender: number;
    dateOfBirth?: string;
    nationality?: string;
    userRole: number;
    recordStatus?: number;
    registrationDate?: string;
    lastLoginDate?: string;
    state: number;
    profileImage: string | null;
    isDualAccount: boolean;
    sceCertificateNo?: string;
    bio?: string;
    yearOfExperience: number;
    workingDistrict: number;
    areaOfPractice: number;
    averageRating: number;
    verificationStatus: number;
    barAssociationMembership?: boolean;
    barAssociationRegNo?: string;
    professionalDesignation?: string;
    officeContactNumber?: string;
    enrollmentCertificate?: string | null;
    nicFrontImage?: string | null;
    nicBackImage?: string | null;
}

export interface GetAdminDto {
    userId: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    userRole?: number;
    gender?: number;
    email?: string;
    nic?: string;
    contactNumber?: string;
    dateOfBirth?: string;
    nationality?: string;
    recordStatus?: number;
    registrationDate?: string;
    lastLoginDate?: string;
    state: number;
    profileImage: string | null;
    createdBy?: string;
    createdAt?: string;
    modifiedBy?: string;
    modifiedAt?: string;
}