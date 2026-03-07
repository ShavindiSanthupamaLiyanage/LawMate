import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import {AuthContextType, LoginRequest, LoginResponse, UserData, UserRole} from '../interfaces/auth.interface';

/**
 * Authentication Context Type
 * Defines all auth-related state and methods available to components
 */


/**
 * Create the context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider Component
 * Wraps the app and provides authentication state to all components
 *
 * @example
 * // In App.tsx or root navigation
 * <AuthProvider>
 *   <NavigationContainer>
 *     <RootNavigator />
 *   </NavigationContainer>
 * </AuthProvider>
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<UserData | null>(null);

    /**
     * Check authentication status on app load
     * This runs once when the app starts
     */
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Check if user is authenticated
     * Loads user data from storage if token exists
     */
    const checkAuth = async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Checking authentication status...');

            // Check if token exists
            const authenticated = await AuthService.isAuthenticated();

            if (authenticated) {
                // Load user data from storage
                const userData = await AuthService.getCurrentUser();

                if (userData) {
                    setIsAuthenticated(true);
                    setUser(userData);
                    console.log('User is authenticated:', userData);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                    console.log('Token exists but no user data found');
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
                console.log('User is not authenticated');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Login user
     *
     * @param credentials - NIC and password
     * @returns Login response with token and user info
     * @throws Error if login fails
     *
     * @example
     * const { login } = useAuth();
     *
     * try {
     *   const response = await login({ NIC: '123456789V', Password: 'pass123' });
     *   if (response.role === 1) {
     *     navigation.navigate('LawyerDashboard');
     *   }
     * } catch (error) {
     *   showError(error.message);
     * }
     */
    const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            console.log('Logging in...');

            // Call auth service
            const response = await AuthService.login(credentials);

            // Update context state
            setIsAuthenticated(true);
            setUser({
                userId: response.userId,
                role: response.role,
                isDualAccount: response.isDualAccount,
            });

            console.log('Login successful, context updated');
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            setIsAuthenticated(false);
            setUser(null);
            throw error;
        }
    };

    /**
     * Logout user
     * Clears all authentication data and resets state
     *
     * @example
     * const { logout } = useAuth();
     *
     * const handleLogout = async () => {
     *   await logout();
     *   navigation.navigate('Login');
     * };
     */
    const logout = async () => {
        try {
            console.log('Logging out...');

            // Call auth service
            await AuthService.logout();

            // Reset context state
            setIsAuthenticated(false);
            setUser(null);

            console.log('Logout successful, context reset');
        } catch (error) {
            console.error('Logout error:', error);

            // Reset state even if API call fails
            setIsAuthenticated(false);
            setUser(null);

            throw error;
        }
    };

    /**
     * Update user data in context
     * Use this when user profile is updated
     *
     * @param updates - Partial user data to update
     *
     * @example
     * const { updateUser } = useAuth();
     * updateUser({ email: 'newemail@example.com' });
     */
    const updateUser = (updates: Partial<UserData>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            console.log('User data updated in context:', updatedUser);
        }
    };

    /**
     * Helper: Check if current user is a lawyer
     */
    const isLawyer = (): boolean => {
        return user?.role === UserRole.LAWYER;
    };

    /**
     * Helper: Check if current user is a client
     */
    const isClient = (): boolean => {
        return user?.role === UserRole.CLIENT;
    };

    /**
     * Helper: Check if current user is an admin
     */
    const isAdmin = (): boolean => {
        return user?.role === UserRole.ADMIN;
    };

    /**
     * Context value
     * All these will be available to components that use useAuth()
     */
    const value: AuthContextType = {
        // State
        isAuthenticated,
        isLoading,
        user,

        // Methods
        login,
        logout,
        checkAuth,
        updateUser,

        // Helpers
        isLawyer,
        isClient,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use authentication context
 *
 * @throws Error if used outside AuthProvider
 *
 * @example
 * import { useAuth } from './context/AuthContext';
 *
 * function MyComponent() {
 *   const { isAuthenticated, user, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginScreen />;
 *   }
 *
 *   return (
 *     <View>
 *       <Text>Welcome, User {user.userId}</Text>
 *       <Button onPress={logout} title="Logout" />
 *     </View>
 *   );
 * }
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

/**
 * USAGE EXAMPLES:
 *
 * 1. Check if user is authenticated:
 *    const { isAuthenticated } = useAuth();
 *
 * 2. Get user data:
 *    const { user } = useAuth();
 *    console.log('User role:', user.role);
 *
 * 3. Login:
 *    const { login } = useAuth();
 *    await login({ NIC: '123456789V', Password: 'pass' });
 *
 * 4. Logout:
 *    const { logout } = useAuth();
 *    await logout();
 *
 * 5. Role checks:
 *    const { isLawyer, isClient } = useAuth();
 *    if (isLawyer()) {
 *      // Show lawyer-specific content
 *    }
 *
 * 6. Loading state:
 *    const { isLoading } = useAuth();
 *    if (isLoading) return <LoadingScreen />;
 */