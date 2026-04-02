import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api/v1';

console.log('[API] Initializing with baseURL:', API_URL);

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
  withCredentials: false,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API service methods
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/auth/login', { email, password }),
    logout: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },
    refreshToken: (refreshToken: string) =>
      apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  },

  // Campaign endpoints
  campaigns: {
    list: (params?: { start_date?: string; end_date?: string; status?: string }) =>
      apiClient.get('/campaigns', { params }),
    get: (id: string) => apiClient.get(`/campaigns/${id}`),
    create: (data: any) => apiClient.post('/campaigns', data),
    update: (id: string, data: any) => apiClient.put(`/campaigns/${id}`, data),
    delete: (id: string) => apiClient.delete(`/campaigns/${id}`),
  },

  // Alert endpoints
  alerts: {
    list: (params?: { is_read?: boolean; limit?: number }) =>
      apiClient.get('/alerts', { params }),
    markAsRead: (id: string) => apiClient.post(`/alerts/${id}/read`),
    markAllAsRead: () => apiClient.post('/alerts/read-all'),
    delete: (id: string) => apiClient.delete(`/alerts/${id}`),
  },

  // Brief endpoints
  briefs: {
    list: (params?: { status?: string; campaign_id?: string }) =>
      apiClient.get('/briefs', { params }),
    save: (data: any) => apiClient.post('/briefs', data),
    generate: (data: any) =>
      apiClient.post('/briefs/generate', data, {
        responseType: 'text', // For SSE streaming
        timeout: 60000, // 60 seconds for AI generation
      }),
    export: (id: string) =>
      apiClient.post(`/briefs/${id}/export`, null, {
        responseType: 'blob',
      }),
  },
};

export default apiClient;
