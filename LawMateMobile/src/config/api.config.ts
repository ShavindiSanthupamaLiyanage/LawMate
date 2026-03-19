/**
 * API Configuration
 *
 * IMPORTANT: Replace 192.168.1.100 with YOUR computer's local IP address
 *
 * To find your IP:
 * - Windows: Open CMD and type 'ipconfig'
 * - Mac/Linux: Open Terminal and type 'ifconfig' or 'ip addr show'
 *
 * Look for IPv4 Address (something like 192.168.x.x or 10.0.x.x)
 */

import { Platform } from "react-native";
import Constants from "expo-constants";

const getBaseUrl = () => {
    if (!__DEV__) {
        // Production
        return 'https://lawmate-api.azurewebsites.net/api';
    }

    // When using tunnel, Metro runs on exp.direct but your API is still local.
    // Use the debuggerHost to derive the machine's IP dynamically.
    const debuggerHost = Constants.expoConfig?.hostUri
        ?? Constants.manifest2?.extra?.expoGo?.debuggerHost
        ?? Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        // Extract just the IP/hostname, strip the port
        const host = debuggerHost.split(':')[0];
        return `http://${host}:5102/api`;
    }

    // Emulator/Simulator
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5102/api';
    }

    return 'http://localhost:5102/api';
};

export const API_CONFIG = {
    BASE_URL: getBaseUrl(),
    TIMEOUT: 30000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

/**
 * API Endpoints
 * All API routes are defined here for easy maintenance
 */
export const ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        REQUEST_RESET_PASSWORD: '/auth/request-reset-password',
        VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
        RESET_PASSWORD_WITH_TOKEN: '/auth/reset-password-with-token',
    },

    // Lawyer endpoints
    LAWYER: {
        REGISTER: "/lawyers",
        MEMBERSHIP_PAYMENT: (lawyerId: string) => `/lawyers/${lawyerId}/membership-payment`,
        PROFILE: '/lawyer/profile',
        UPDATE_PROFILE: '/lawyer/profile',
        CASES: '/lawyer/cases',
        CASE_DETAIL: (caseId: string) => `/lawyer/cases/${caseId}`,
        APPOINTMENTS: '/lawyer/appointments',
        CLIENTS: '/lawyer/clients',
        GET_BY_USER_ID: (userId: string) => `/lawyers/${userId}`,
    },

    // Client endpoints
    CLIENT: {
        REGISTER: '/clients',
        PROFILE: '/client/profile',
        UPDATE_PROFILE: '/client/profile',
        APPOINTMENTS: '/client/appointments',
        LAWYERS: '/client/lawyers',
        SUSPEND: (userId: string) => `/clients/suspend/${userId}`,
    },

    // Admin endpoints
    ADMIN: {
        USERS: '/admin/users',
        USER_COUNTS: '/users/counts',
        LAWYER_VERIFICATION: '/lawyer-verification/all',
        REPORTS: {
            LAWYER_DETAILS: '/admin/reports/lawyer-details',
            CLIENT_DETAILS: '/admin/reports/client-details',
            MEMBERSHIP_RENEWALS: '/admin/reports/membership-renewals',
            PLATFORM_COMMISSION: '/admin/reports/platform-commission',
            MONTHLY_REVENUE: '/admin/reports/monthly-revenue',
            FINANCIAL_SUMMARY: '/admin/reports/financial-summary',
        },
    },
    USER: {
        GET_BY_NIC: (nic: string) => `/users/${nic}/email`,
        GET_BY_ID: (userId: string) => `/users/${userId}`,
    },
    CONTACT: {
        SEND: '/contactUs/send',
    },
    CHATBOT: {
        CLASSIFY: '/chatbot/classify',
    },
    ADMIN_FINANCE: {
        ALL_FINANCE_DETAILS: '/admin/finance/all-finance-details',
        CONFIRM_PAYOUT: '/admin/finance/confirm-payout',
        GET_PENDING: '/admin/finance/pending',
        GET_PAID:    '/admin/finance/paid',
    },

     BOOKING: {
        GET_LAWYER_APPOINTMENTS: (lawyerId: string) =>`/bookings/lawyer/${lawyerId}`,
        GET_BY_ID: (bookingId: number) => `/bookings/${bookingId}`,
        CREATE: "/bookings",
        UPDATE_STATUS: (bookingId: number) => `/bookings/${bookingId}/status`,
  },
      LAWYER_EVENT: {
          GET_LAWYER_EVENTS: (lawyerId: string) => `/lawyer-events/lawyer/${lawyerId}`,
          CREATE: "/lawyer-events",
          UPDATE: (eventId: number) => `/lawyer-events/${eventId}`,
          DELETE: (eventId: number) => `/lawyer-events/${eventId}`,
      },
  AVAILABILITY: {
        GET_LAWYER_SLOTS: (lawyerId: string) => `/availability/lawyer/${lawyerId}`,
        CREATE: "/availability",
        UPDATE: (slotId: number) => `/availability/${slotId}`,
        DELETE: (slotId: number) => `/availability/${slotId}`,
  },

    LAWYER_VERIFICATION: {
        ACCEPT: (userId: string) => `/lawyer-verification/${userId}/accept`,
        REJECT: (userId: string) => `/lawyer-verification/${userId}/reject`,
    },
    PAYMENTS: {
        ALL: '/admin/payments',
        PENDING: '/admin/payments/pending',
        APPROVED: '/admin/payments/accepted',
        REJECTED: '/admin/payments/rejected',
        GET_DETAILS: (lawyerId: string, type: string, clientId?: string | null) => {
            const base = `/admin/payments/details?lawyerId=${lawyerId}&type=${type}`;
            return clientId ? `${base}&clientId=${clientId}` : base;
        },
    },
    LAWYER_FINANCE: {
        DASHBOARD:     '/lawyer/finance/dashboard',
        TRANSACTIONS:  '/lawyer/finance/transactions',
        REPORT:        '/lawyer/finance/report',
    },
};
