import { API_CONFIG } from "../config/api.config";
import { GetClientDto } from "../interfaces/userDetails.interface";
import { StorageService } from "../utils/storage";

export const ClientService = {
    getAll: async (): Promise<GetClientDto[]> => {
        const token = await StorageService.getToken();
        const response = await fetch(`${API_CONFIG.BASE_URL}/clients`, {
            headers: {
                ...API_CONFIG.HEADERS,
                Authorization: `Bearer ${token}`,
            },
        });

        const rawText = await response.text();
        if (!rawText) throw new Error("Empty response from server.");

        const json = JSON.parse(rawText);
        if (!response.ok) {
            throw new Error(json?.message ?? `Failed to fetch clients (HTTP ${response.status})`);
        }

        return json as GetClientDto[];
    },
};