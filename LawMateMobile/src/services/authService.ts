import apiClient from '../api/client';
import { ENDPOINTS } from '../config/api.config';
import { LoginRequest, LoginResponse, UserData } from '../interfaces/auth.interface';
import { StorageService } from '../utils/storage';

/**
 * AuthService
 * Handles all authentication-related API calls
 */
export class AuthService {

    /**
     * Login user with NIC and password
     *
     * @param credentials - User's NIC and password
     * @returns Login response with token and user data
     * @throws Error if login fails
     *
     * @example
     * try {
     *   const response = await AuthService.login({
     *     NIC: '123456789V',
     *     Password: 'password123'
     *   });
     *   console.log('Token:', response.accessToken);
     * } catch (error) {
     *   console.error('Login failed:', error.message);
     * }
     */
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            console.log('Attempting login for NIC:', credentials.NIC);

            // Call backend login API
            const response = await apiClient.post<LoginResponse>(
                ENDPOINTS.AUTH.LOGIN,
                credentials
            );

            console.log('Login successful:', {
                userId: response.data.userId,
                role: response.data.role,
                isDualAccount: response.data.isDualAccount,
            });

            // Save authentication data to secure storage
            if (response.data.accessToken) {
                // Save token
                await StorageService.saveToken(response.data.accessToken);

                // Save user data
                const userData: UserData = {
                    userId: response.data.userId,
                    role: response.data.role,
                    isDualAccount: response.data.isDualAccount,
                };
                await StorageService.saveUserData(userData);

                // Save role separately for quick access
                await StorageService.saveUserRole(response.data.role);

                console.log('Authentication data saved to storage');
            }

            return response.data;
        } catch (error: any) {
            console.error('Login failed:', error.message);
            throw error;
        }
    }

    /**
     * Logout user
     * Clears all authentication data from storage
     *
     * @example
     * await AuthService.logout();
     */
    static async logout(): Promise<void> {
        try {
            console.log('Logging out...');

            // Clear all local storage
            await StorageService.clearAll();

            console.log('Logout successful');
        } catch (error) {
            console.error('Logout error:', error);

            // Always clear local storage even if API call fails
            await StorageService.clearAll();
        }
    }

    /**
     * Check if user is authenticated
     *
     * @returns true if user has a valid token
     *
     * @example
     * const isLoggedIn = await AuthService.isAuthenticated();
     * if (!isLoggedIn) {
     *   navigation.navigate('Login');
     * }
     */
    static async isAuthenticated(): Promise<boolean> {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                return false;
            }

            // TODO: You can add token validation here
            // For example, check if token is expired by decoding JWT
            // For now, we just check if token exists

            return true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    /**
     * Get current user data from storage
     *
     * @returns User data or null if not logged in
     *
     * @example
     * const user = await AuthService.getCurrentUser();
     * if (user) {
     *   console.log('User role:', user.role);
     * }
     */
    static async getCurrentUser(): Promise<UserData | null> {
        try {
            return await StorageService.getUserData();
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Get current user's role
     *
     * @returns User role (1=Lawyer, 2=Client, 3=Admin) or null
     *
     * @example
     * const role = await AuthService.getUserRole();
     * if (role === 1) {
     *   console.log('User is a lawyer');
     * }
     */
    static async getUserRole(): Promise<number | null> {
        try {
            return await StorageService.getUserRole();
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    }

    /**
     * Refresh authentication token
     * Call this when token is about to expire
     *
     * NOTE: You need to implement the refresh token endpoint in your backend
     *
     * @returns New access token
     */
    static async refreshToken(): Promise<string> {
        try {
            console.log('Refreshing token...');

            const response = await apiClient.post<{ accessToken: string }>(
                ENDPOINTS.AUTH.REFRESH_TOKEN
            );

            if (response.data.accessToken) {
                await StorageService.saveToken(response.data.accessToken);
                console.log('Token refreshed successfully');
            }

            return response.data.accessToken;
        } catch (error: any) {
            console.error('Token refresh failed:', error.message);

            // If refresh fails, logout user
            await this.logout();
            throw error;
        }
    }

    /**
     * Forgot password - Send reset code to email
     *
     * @param nic - User's NIC
     * @returns Success message
     */
    static async forgotPassword(nic: string): Promise<{ message: string }> {
        try {
            console.log('Requesting password reset for NIC:', nic);

            const response = await apiClient.post<{ message: string }>(
                ENDPOINTS.AUTH.FORGOT_PASSWORD,
                { NIC: nic }
            );

            console.log('Password reset email sent');
            return response.data;
        } catch (error: any) {
            console.error('Forgot password failed:', error.message);
            throw error;
        }
    }

    /**
     * Validate token (check if still valid)
     * Useful for checking if user session is still active
     *
     * @returns true if token is valid
     */
    static async validateToken(): Promise<boolean> {
        try {
            const token = await StorageService.getToken();

            if (!token) {
                return false;
            }

            // You can decode JWT and check expiration
            // For now, we'll try to make an authenticated request
            // If it succeeds, token is valid. If it fails with 401, token is invalid

            // TODO: Add a /validate-token endpoint in your backend
            // const response = await apiClient.get('/common/validate-token');
            // return response.status === 200;

            return true; // For now, assume token is valid if it exists
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    }

    static async requestResetPassword(nic: string, email: string): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(
            ENDPOINTS.AUTH.REQUEST_RESET_PASSWORD,
            { nic, email }
        );
        return response.data;
    }

    static async resetPasswordWithToken(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await apiClient.post<{ message: string }>(
            ENDPOINTS.AUTH.RESET_PASSWORD_WITH_TOKEN,
            { token, newPassword }
        );
        return response.data;
    }

    static async verifyResetToken(token: string): Promise<boolean> {
        try {
            const response = await apiClient.get(ENDPOINTS.AUTH.VERIFY_RESET_TOKEN, {
                params: { token }
            });
            return response.status === 200;
        } catch (error: any) {
            return false;
        }
    }
}