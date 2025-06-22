import { useEffect } from 'react';
import { pingService } from '../services/pingService';

export const useApiHealth = () => {
    useEffect(() => {
        const checkApiHealth = async () => {
            try {
                await pingService.ping();
            } catch (error) {
                console.error('API Health Check Failed:', error);
            }
        };

        // Check immediately on mount
        checkApiHealth();

        // Set up periodic health check (every 30 seconds)
        const intervalId = setInterval(checkApiHealth, 30000);

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, []);
}; 