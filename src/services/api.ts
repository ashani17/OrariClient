import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import config from '../config';
import { authService } from './authService';

// Create axios instance with default config
const api = axios.create({
    baseURL: config.apiUrl,
    timeout: config.requestTimeout,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            authService.logout();
        }
        return Promise.reject(error);
    }
);

// Configure retry logic
axiosRetry(api, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
               error.response?.status === 429; // Retry on rate limit
    }
});

export default api; 