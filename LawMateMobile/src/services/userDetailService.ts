import apiClient from "../api/client";
import {ENDPOINTS} from "../config/api.config";
import {LawyerVerificationListDto, UserCountsDto} from "../interfaces/userDetails.interface";

export class UserDetailService {

    static async getUserByNic(nic: string): Promise<{ email: string; userId: string } | null> {
        try {
            const response = await apiClient.get( ENDPOINTS.USER.GET_BY_NIC(nic.trim().toUpperCase()));
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) return null;
            throw error;
        }
    }

    static async getUserCounts(): Promise<UserCountsDto> {
        const response = await apiClient.get(ENDPOINTS.ADMIN.USER_COUNTS);
        return response.data;
    }

    static async getAllLawyerVerifications(): Promise<LawyerVerificationListDto[]> {
        const response = await apiClient.get(ENDPOINTS.ADMIN.LAWYER_VERIFICATION);
        return response.data;
    }

    static async getUserById(userId: string): Promise<{ firstName: string; lastName: string; email: string } | null> {
        try {
            const response = await apiClient.get(ENDPOINTS.USER.GET_BY_ID(userId));
            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) return null;
            throw error;
        }
    }
}