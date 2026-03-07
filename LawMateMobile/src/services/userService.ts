import apiClient from "../api/client";
import {ENDPOINTS} from "../config/api.config";

export class UserService {

    static async getUserByNic(nic: string): Promise<{ email: string; userId: string } | null> {
        try {
            const response = await apiClient.get( ENDPOINTS.USER.GET_BY_NIC(nic.trim().toUpperCase()));
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) return null;
            throw error;
        }
    }
}