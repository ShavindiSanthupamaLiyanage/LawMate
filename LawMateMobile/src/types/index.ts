// Navigation Types
import {NavigatorScreenParams} from "@react-navigation/core";

export type LawyerStackParamList = {
    LawyerTabNavigator: NavigatorScreenParams<LawyerTabParamList> | undefined;
    LawyerProfile: undefined;
    LawyerPersonalDetails: undefined;
    LawyerProfessionalDetails: undefined;
    Availability: undefined;
    SettingsPreferences: undefined;
    Help: undefined;
    AddAppointment: undefined;
    SetAvailability: undefined;
};

export type ClientStackParamList = {
    ClientTabNavigator: NavigatorScreenParams<ClientTabParamList> | undefined;
    ClientProfile: undefined;
    ClientPersonalDetails: undefined;
    SettingsPreferences: undefined;
    Help: undefined;
};

export type AdminStackParamList = {
    AdminTabNavigator: NavigatorScreenParams<AdminTabParamList> | undefined;
    AdminProfile: undefined;
    AdminPersonalDetails: undefined;
    SettingsPreferences: undefined;
    Help: undefined;
};

export type RootStackParamList = {
    Splash: undefined;
    Welcome: undefined;
    Login: undefined;
    Register: { userType: 'lawyer' | 'client' };
    ForgotPassword: undefined;
    LawyerSignUp: undefined;
    ClientSignUp: undefined;
    VerificationPending: undefined;
    ResetPassword: undefined;
    PaymentSubmission:undefined;
    PaymentVerification:undefined;
    ViewTransactions: undefined;
    EarningsReport: undefined;
    // LawyerTabs: NavigatorScreenParams<LawyerTabParamList>;
    // ClientTabs: NavigatorScreenParams<ClientTabParamList>;
    // AdminTabs: NavigatorScreenParams<AdminTabParamList>;
    AppointmentView:{ request: any };
    // LawyerTabs: NavigatorScreenParams<LawyerTabParamList>;
    // ClientTabs: NavigatorScreenParams<ClientTabParamList>;
    // AdminTabs: NavigatorScreenParams<AdminTabParamList>;
    LawyerTabs: NavigatorScreenParams<LawyerStackParamList>;
    ClientTabs: NavigatorScreenParams<ClientStackParamList>;
    AdminTabs: NavigatorScreenParams<AdminStackParamList>;
    ClientAppointmentView:{request:any}
    PaymentSlipScreen:{request:any}
    PaymentSlipReceivedScreen:{request:any}
};

export type LawyerTabParamList = {
    Dashboard: undefined;
    Cases: undefined;
    Calendar: undefined;
    Profile: undefined;
    LawyerProfile: undefined;
    LawyerPersonalDetails: undefined;
    LawyerProfessionalDetails: undefined;
    Availability: undefined;
    SettingsPreferences: undefined;
    Help: undefined;
    Bookings: undefined;
    Finance: undefined;
    Knowledge: undefined;
    Requests: undefined;
    AppointmentView: undefined;
};

export type ClientTabParamList = {
    Dashboard: undefined;
    Contacts: undefined;
    Requests: undefined;
    Profile: undefined;
    ClientProfile: undefined;
    ClientPersonalDetails: undefined;
    SettingsPreferences: undefined;
    Help: undefined;
    Bookings: undefined;
    Lawyers: undefined;
    Knowledge: undefined;
    AppointmentView: undefined;
};

export type AdminTabParamList = {
    Dashboard: undefined;
    Users: undefined;
    Reports: undefined;
    Settings: undefined;
    Verifications: undefined;
    Finance: undefined;
    Payment: undefined;
    AdminProfile: undefined;
    AdminPersonalDetails: undefined;
    SettingsPreferences: undefined;
    Help: undefined;
    Bookings: undefined;
    
};


// User Types
export type UserType = 'lawyer' | 'client' | 'admin';

export interface User {
    email: string;
    password: string;
    type: UserType;
    name: string;
}

export interface UserCredentials {
    email: string;
    password: string;
}

// Component Props Types
export interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?:
        | 'primary'
        | 'secondary'
        | 'transparent'
        | 'accept'
        | 'reject';
    disabled?: boolean;
    loading?: boolean;
    style?: any;
    textStyle?: any;
}

export interface AlertProps {
    visible: boolean;
    title?: string;
    message?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onClose?: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export interface InputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    error?: string;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

// Alert State Type
export interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
}