import apiClient from '../api/httpClient';
import { ENDPOINTS } from '../config/api.config';
import { StorageService } from '../utils/storage';
import {AdminDashboardDto} from "../interfaces/adminDashboard.interface";

const authHeader = async () => {
    const token = await StorageService.getToken();
    return { Authorization: `Bearer ${token}` };
};

export class AdminService {
    static async getDashboard(): Promise<AdminDashboardDto> {
        const response = await apiClient.get<AdminDashboardDto>(
            ENDPOINTS.ADMIN.DASHBOARD,
            { headers: await authHeader() }
        );
        return response.data;
    }
}