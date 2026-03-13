export interface ClientRegistrationDetails {
    prefix:          number;
    firstName:       string;
    lastName:        string;
    gender:          number;
    address:         string;
    district:        number;
    nic:             string;
    mobileContact:   string;
    language:        number;
    email:           string;
    password:        string;
    confirmPassword: string;
    profilePic:      string | null;
}

export interface CreateClientDto {
    prefix:            number;
    firstName:         string;
    lastName:          string;
    gender:            number;
    address:           string;
    district:          number;
    nic:               string;
    contactNumber:     string;
    preferredLanguage: number;
    email:             string;
    password:          string;
    profileImage:      string | null;
}
