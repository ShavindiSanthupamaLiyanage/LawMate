import AsyncStorage from '@react-native-async-storage/async-storage';
// For better security, use SecureStore instead:
// import * as SecureStore from 'expo-secure-store';

/**
 * Storage keys used throughout the app
 * Using @ prefix is a common convention to namespace your app's keys
 */
const STORAGE_KEYS = {
    ACCESS_TOKEN: '@lawmate_access_token',
    USER_DATA: '@lawmate_user_data',
    USER_ROLE: '@lawmate_user_role',
    REFRESH_TOKEN: '@lawmate_refresh_token',
} as const;

/**
 * StorageService - Handles all secure storage operations
 *
 * SECURITY NOTE:
 * - AsyncStorage stores data as plain text (unencrypted)
 * - For production, consider using expo-secure-store for sensitive data
 * - SecureStore uses iOS Keychain and Android KeyStore (encrypted)
 */
export class StorageService {

    // ============ TOKEN MANAGEMENT ============

    /**
     * Save access token to secure storage
     * @param token - JWT access token from backend
     */
    static async saveToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);

            // For SecureStore (more secure):
            // await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);

            console.log('Token saved successfully');
        } catch (error) {
            console.error('Error saving token:', error);
            throw new Error('Failed to save authentication token');
        }
    }

    /**
     * Get access token from storage
     * @returns Token string or null if not found
     */
    static async getToken(): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

            // For SecureStore:
            // const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

            return token;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    /**
     * Remove access token (used during logout)
     */
    static async removeToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

            // For SecureStore:
            // await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

            console.log('Token removed successfully');
        } catch (error) {
            console.error('Error removing token:', error);
            throw new Error('Failed to remove authentication token');
        }
    }

    // ============ USER DATA MANAGEMENT ============

    /**
     * Save user data to storage
     * @param user - User object with userId, role, etc.
     */
    static async saveUserData(user: any): Promise<void> {
        try {
            const userData = JSON.stringify(user);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, userData);
            console.log('User data saved:', user);
        } catch (error) {
            console.error('Error saving user data:', error);
            throw new Error('Failed to save user data');
        }
    }

    /**
     * Get user data from storage
     * @returns User object or null if not found
     */
    static async getUserData(): Promise<any | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

            if (userData) {
                return JSON.parse(userData);
            }

            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    /**
     * Update specific user data fields
     * @param updates - Partial user data to update
     */
    static async updateUserData(updates: Partial<any>): Promise<void> {
        try {
            const currentData = await this.getUserData();

            if (currentData) {
                const updatedData = { ...currentData, ...updates };
                await this.saveUserData(updatedData);
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            throw new Error('Failed to update user data');
        }
    }

    // ============ ROLE MANAGEMENT ============

    /**
     * Save user role separately for quick access
     * @param role - User role number (1=Lawyer, 2=Client, 3=Admin)
     */
    static async saveUserRole(role: number): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role.toString());
        } catch (error) {
            console.error('Error saving user role:', error);
        }
    }

    /**
     * Get user role
     * @returns Role number or null
     */
    static async getUserRole(): Promise<number | null> {
        try {
            const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
            return role ? parseInt(role, 10) : null;
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    }

    // ============ CLEAR DATA ============

    /**
     * Clear all stored data (used during logout)
     * IMPORTANT: This removes all authentication data
     */
    static async clearAll(): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
                AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE),
                AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
            ]);

            console.log('All storage cleared');
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw new Error('Failed to clear storage');
        }
    }

    // ============ DEBUG HELPERS ============

    /**
     * Get all stored keys (for debugging)
     * ⚠️ Only use in development!
     */
    static async getAllKeys(): Promise<readonly string[]> {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (error) {
            console.error('Error getting all keys:', error);
            return [];
        }
    }

    /**
     * Print all stored data (for debugging)
     * ⚠️ Only use in development! Never in production!
     */
    static async debugPrintAll(): Promise<void> {
        if (__DEV__) {
            try {
                const keys = await this.getAllKeys();
                console.log('All Storage Keys:', keys);

                for (const key of keys) {
                    if (key.startsWith('@lawmate')) {
                        const value = await AsyncStorage.getItem(key);
                        console.log(`   ${key}:`, value);
                    }
                }
            } catch (error) {
                console.error('Error debugging storage:', error);
            }
        }
    }
}
