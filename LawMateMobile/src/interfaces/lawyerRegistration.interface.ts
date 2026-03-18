/**
 * lawyerRegistration.interface.ts
 *
 * Enum fields are typed as `number | ""`:
 *  - "" = nothing selected yet (initial state)
 *  - number = the integer value from enums.ts that the backend expects
 *
 * Use enumOptions.ts to populate SelectInput items.
 */

export interface FileAsset {
    uri:       string;
    name:      string;
    mimeType?: string;
    size?:     number;
}

export interface LawyerPersonalDetails {
    prefix:          number | "";
    firstName:       string;
    lastName:        string;
    gender:          number | "";
    address:         string;
    officeAddress:   string;
    nic:             string;
    mobileContact:   string;
    officeContact:   string;
    email:           string;
    password:        string;
    confirmPassword: string;
}

export interface LawyerProfessionalDetails {
    sceCertificateNo:         string;
    barAssociationMembership: boolean;
    designation:              string;
    areaOfPractice:           number | "";
    barAssociationRegNo:      string;
    yearOfExperience:         string;
    workingDistrict:          number | "";
    enrollmentCertificate:    FileAsset | null;
    nicFrontImage:            FileAsset | null;
    nicBackImage:             FileAsset | null;
    profileImage:             FileAsset | null;
    confirmed:                boolean;
}

export type LawyerRegistrationForm =
    LawyerPersonalDetails & LawyerProfessionalDetails;

export interface CreateLawyerResponse {
    message:  string;
    lawyerId: string;
}