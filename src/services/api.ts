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
        console.log('API Request - URL:', config.url);
        console.log('API Request - Method:', config.method);
        console.log('API Request - Token exists:', !!token);
        console.log('API Request - Token:', token ? token.substring(0, 50) + '...' : 'No token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('API Request - Authorization header set');
        } else {
            console.log('API Request - No token found in localStorage');
        }
        
        console.log('API Request - Headers:', config.headers);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('API Response - Status:', response.status);
        console.log('API Response - URL:', response.config.url);
        return response;
    },
    (error: AxiosError) => {
        console.error('API Response Error - Status:', error.response?.status);
        console.error('API Response Error - URL:', error.config?.url);
        console.error('API Response Error - Data:', error.response?.data);
        console.error('API Response Error - Headers:', error.response?.headers);
        
        if (error.response?.status === 401) {
            console.log('API Response Error - Unauthorized, logging out');
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