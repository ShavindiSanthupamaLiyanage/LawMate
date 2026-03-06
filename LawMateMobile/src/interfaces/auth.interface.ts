/**
 * Login Request - matches your backend LoginRequest
 */
export interface LoginRequest {
    NIC: string;
    Password: string;
}

/**
 * Login Response - matches your backend response
 */
export interface LoginResponse {
    accessToken: string;
    userId: string;
    role: number;
    isDualAccount: boolean;
}

/**
 * User type mapping
 */
export enum UserRole {
    ADMIN = 0,
    LAWYER = 1,
    CLIENT = 2,
}

/**
 * User data stored locally
 */
export interface UserData {
    userId: string;
    role: number;
    isDualAccount: boolean;
    email?: string;
    name?: string;
    nic?: string;
}

/**
 * API Error Response
 */
export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface AuthContextType {
    // State
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserData | null;

    // Methods
    login: (credentials: LoginRequest) => Promise<LoginResponse>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    updateUser: (updates: Partial<UserData>) => void;

    // Helper methods
    isLawyer: () => boolean;
    isClient: () => boolean;
    isAdmin: () => boolean;
}