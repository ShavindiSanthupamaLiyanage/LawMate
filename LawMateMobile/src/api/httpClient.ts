import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig} from 'axios';
import { API_CONFIG } from '../config/api.config';
import { StorageService } from '../utils/storage';
import {ApiError} from "../interfaces/auth.interface";

/**
 * Create configured Axios instance
 * This is the base HTTP client used for all API requests
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

// ============ REQUEST INTERCEPTOR ============

/**
 * Request Interceptor
 * Automatically adds the JWT token to every request
 */
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            // Get token from secure storage
            const token = await StorageService.getToken();

            // Add Authorization header if token exists
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Log request in development
            if (__DEV__) {
                console.log('📤 API Request:', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    baseURL: config.baseURL,
                    fullURL: `${config.baseURL}${config.url}`,
                    hasToken: !!token,
                    data: config.data,
                });
            }

            return config;
        } catch (error) {
            console.error('❌ Request interceptor error:', error);
            return config;
        }
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// ============ RESPONSE INTERCEPTOR ============

/**
 * Response Interceptor
 * Handles responses and errors globally
 */
apiClient.interceptors.response.use(
    // Success handler
    (response) => {
        // Log successful response in development
        if (__DEV__) {
            console.log('✅ API Response:', {
                method: response.config.method?.toUpperCase(),
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },

    // Error handler
    async (error: AxiosError) => {
        const originalRequest = error.config;

        const responseData = error.response?.data as ApiError | any;

        // Log error in development
        if (__DEV__) {
            console.error('❌ API Error:', {
                method: error.config?.method?.toUpperCase(),
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
        }

        // Handle different error scenarios

        // 1. Network Error (no internet, server down, etc.)
        if (!error.response) {
            return Promise.reject({
                message: 'Network error. Please check your internet connection.',
                statusCode: 0,
                type: 'NETWORK_ERROR',
            });
        }

        // 2. 401 Unauthorized - Token expired or invalid
        if (error.response.status === 401 && originalRequest) {
            console.log('🔐 Unauthorized - Token expired or invalid');

            // Clear all auth data
            await StorageService.clearAll();

            if (navigationRef) {
                navigationRef.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }

            return Promise.reject({
                message: 'Session expired. Please login again.',
                statusCode: 401,
                type: 'UNAUTHORIZED',
            });
        }

        // 3. 403 Forbidden - No permission
        if (error.response.status === 403) {
            return Promise.reject({
                message: 'You do not have permission to perform this action.',
                statusCode: 403,
                type: 'FORBIDDEN',
            });
        }

        // 4. 404 Not Found
        if (error.response.status === 404) {
            return Promise.reject({
                message: 'Resource not found.',
                statusCode: 404,
                type: 'NOT_FOUND',
            });
        }

        // 5. 500 Server Error
        if (error.response.status >= 500) {
            return Promise.reject({
                message: 'Server error. Please try again later.',
                statusCode: error.response.status,
                type: 'SERVER_ERROR',
            });
        }

        // 6. Other errors - extract message from response
        const errorMessage =
            responseData?.message ||
            responseData?.error ||
            error.message ||
            'An unexpected error occurred';

        return Promise.reject({
            message: errorMessage,
            statusCode: error.response?.status || 500,
            data: error.response?.data,
            type: 'API_ERROR',
        });
    }
);

// ============ NAVIGATION INTEGRATION (Optional) ============

/**
 * Navigation Reference
 * Used to navigate from anywhere in the app (including interceptors)
 *
 * Setup in your root navigation file:
 *
 * import { setNavigationRef } from './api/client';
 *
 * const navigationRef = useNavigationContainerRef();
 *
 * useEffect(() => {
 *   setNavigationRef(navigationRef);
 * }, []);
 */
let navigationRef: any = null;

export const setNavigationRef = (ref: any) => {
    navigationRef = ref;
};

export const navigateToLogin = () => {
    if (navigationRef) {
        navigationRef.navigate('Login');
    }
};

// ============ HELPER METHODS ============

/**
 * Test API connection
 * Useful for debugging
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        // Try a simple GET request to a health check endpoint
        const response = await apiClient.get('/health');
        console.log('✅ API connection successful:', response.status);
        return true;
    } catch (error) {
        console.error('❌ API connection failed:', error);
        return false;
    }
};

/**
 * Check if error is network related
 */
export const isNetworkError = (error: any): boolean => {
    return error?.type === 'NETWORK_ERROR' || error?.statusCode === 0;
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error: any): boolean => {
    return error?.type === 'UNAUTHORIZED' || error?.statusCode === 401;
};

// Export the configured client
export default apiClient;