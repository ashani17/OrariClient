import api from './api';

interface PingResponse {
    message: string;
    timestamp: string;
}

class PingService {
    async ping(): Promise<PingResponse> {
        try {
            const response = await api.get<PingResponse>('/ping');
            console.log('API Connection successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('API Connection failed:', error);
            throw error;
        }
    }
}

export const pingService = new PingService(); 