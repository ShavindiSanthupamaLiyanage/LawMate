import { API_CONFIG, ENDPOINTS } from '../config/api.config';
import { StorageService } from '../utils/storage';
import {
    ClientActivity,
    ClientDashboardHomeResponse,
} from '../interfaces/clientDashboard.interface';

export class ClientDashboardService {
    static async getDashboardHome(): Promise<ClientDashboardHomeResponse> {
        const token = await StorageService.getToken();

        const response = await fetch(
            `${API_CONFIG.BASE_URL}${ENDPOINTS.CLIENT.DASHBOARD_HOME}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to load dashboard home: ${response.status}`);
        }

        return await response.json();
    }

    static async getDashboardActivity(): Promise<ClientActivity[]> {
        const token = await StorageService.getToken();

        const response = await fetch(
            `${API_CONFIG.BASE_URL}${ENDPOINTS.CLIENT.DASHBOARD_ACTIVITY}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to load dashboard activity: ${response.status}`);
        }

        return await response.json();
    }
}