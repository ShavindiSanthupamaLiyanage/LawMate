import apiClient from "../api/client";
import { ENDPOINTS } from "../config/api.config";
import { GetAdminDto, GetClientDto, GetLawyerDto } from "../interfaces/userDetails.interface";

export interface UpdateAdminProfilePayload {
    userId: string;
    firstName?: string;
    lastName?: string;
    gender?: number;
    email?: string;
    contactNumber?: string;
    dateOfBirth?: string;
    nationality?: string;
}

export interface UpdateClientProfilePayload {
    userId: string;
    prefix: number;
    firstName?: string;
    lastName?: string;
    gender: number;
    email?: string;
    contactNumber?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    district?: string;
    prefferedLanguage: number;
}

export interface UpdateLawyerProfilePayload {
    userId: string;
    contactNumber?: string;
    gender?: number;
    dateOfBirth?: string;
    nationality?: string;
    bio?: string;
    yearOfExperience: number;
    workingDistrict: number;
    areaOfPractice: number;
    officeContactNumber?: string;
}

export class ProfileService {
    static async getAdminByUserId(userId: string): Promise<GetAdminDto> {
        const response = await apiClient.get<GetAdminDto>(ENDPOINTS.ADMIN.GET_BY_USER_ID(userId));
        return response.data;
    }

    static async getClientByUserId(userId: string): Promise<GetClientDto> {
        const response = await apiClient.get<GetClientDto>(ENDPOINTS.CLIENT.GET_BY_USER_ID(userId));
        return response.data;
    }

    static async getLawyerByUserId(userId: string): Promise<GetLawyerDto> {
        const response = await apiClient.get<GetLawyerDto>(ENDPOINTS.LAWYER.GET_BY_USER_ID(userId));
        return response.data;
    }

    static async updateAdminProfile(userId: string, payload: UpdateAdminProfilePayload): Promise<boolean> {
        const response = await apiClient.put<boolean>(ENDPOINTS.ADMIN.UPDATE_PROFILE(userId), payload);
        return response.data;
    }

    static async updateClientProfile(userId: string, payload: UpdateClientProfilePayload): Promise<string> {
        const response = await apiClient.put<string>(ENDPOINTS.CLIENT.UPDATE_PROFILE(userId), payload);
        return response.data;
    }

    static async updateLawyerProfile(
        userId: string,
        payload: UpdateLawyerProfilePayload,
    ): Promise<unknown> {
        const response = await apiClient.put<unknown>(ENDPOINTS.LAWYER.UPDATE_PROFILE(userId), payload);
        return response.data;
    }
}
