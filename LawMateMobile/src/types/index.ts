// Navigation Types
import {NavigatorScreenParams} from "@react-navigation/core";

export type RootStackParamList = {
    Splash: undefined;
    Welcome: undefined;
    Login: undefined;
    Register: { userType: 'lawyer' | 'client' };
    ForgotPassword: undefined;
    ResetPassword: undefined;
    // LawyerTabs: undefined;
    // ClientTabs: undefined;
    // AdminTabs: undefined;
    LawyerTabs: NavigatorScreenParams<LawyerTabParamList>;
    ClientTabs: NavigatorScreenParams<ClientTabParamList>;
    AdminTabs: NavigatorScreenParams<AdminTabParamList>;
};

export type LawyerTabParamList = {
    Dashboard: undefined;
    Cases: undefined;
    Calendar: undefined;
    Profile: undefined;
    Bookings: undefined;
    Finance: undefined;
    Knowledge: undefined;
};

export type ClientTabParamList = {
    Dashboard: undefined;
    Lawly: undefined;
    Requests: undefined;
    Profile: undefined;
    Bookings: undefined;
    Lawyers: undefined;
    Knowledge: undefined;
};

export type AdminTabParamList = {
    Dashboard: undefined;
    Users: undefined;
    Reports: undefined;
    Settings: undefined;
    Bookings: undefined;
    Finance: undefined;
    Payment: undefined;
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