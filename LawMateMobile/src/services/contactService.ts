import apiClient from '../api/client';
import { ENDPOINTS } from '../config/api.config';

export class ContactService {
    static async sendMessage(data: {
        fullName: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<boolean> {
        const response = await apiClient.post<boolean>(ENDPOINTS.CONTACT.SEND, data);
        return response.data;
    }
}