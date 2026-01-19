/**
 * API Client Configuration
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.error || error.response.data?.message || error.message;
      console.error('API Error:', message);
      
      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        // Only redirect if not already on login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', 'No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

