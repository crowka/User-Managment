import axios from 'axios';
import { getCSRFToken, generateCSRFToken, storeCSRFToken } from '../utils/csrf';

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token and CSRF token to all requests
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Get existing CSRF token or generate a new one
    const csrfToken = getCSRFToken() || generateCSRFToken();
    
    // Store the CSRF token
    storeCSRFToken(csrfToken);
    
    // Add CSRF token to headers
    config.headers['X-CSRF-Token'] = csrfToken;
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling auth and CSRF errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    // If we get a 403 with CSRF error, regenerate token and retry
    if (error.response?.status === 403 && 
        error.response?.data?.error?.includes('CSRF')) {
      
      // Clear existing token
      localStorage.removeItem('csrf_token');
      localStorage.removeItem('csrf_token_expiration');
      
      // Generate new token
      const newToken = generateCSRFToken();
      storeCSRFToken(newToken);
      
      // Retry the request with the new token
      const originalRequest = error.config;
      originalRequest.headers['X-CSRF-Token'] = newToken;
      
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

export default api;