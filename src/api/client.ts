import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Don't add token to login request
    const isLoginRequest = config.url?.includes('/User/Login');
    
    if (token && !isLoginRequest && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('roleName');
      // Only reload if we are not on the login page already to avoid loops
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    return Promise.reject(error);
  }
);

/**
 * Compatibility wrapper for existing apiFetch calls
 */
export async function apiFetch<T>(endpoint: string, options: any = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, ...config } = options;
  
  const token = localStorage.getItem('token');
  const isLoginRequest = endpoint.includes('/User/Login');
  
  const finalHeaders = { ...headers };
  if (token && !isLoginRequest) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }
  if (body instanceof FormData) {
    finalHeaders['Content-Type'] = undefined;
  }
  console.log(body);
  window.dispatchEvent(new CustomEvent('api-fetch-start'));
  try {
    const response = await api.request({
      url: endpoint,
      method: method,
      headers: finalHeaders,
      data: body ? (typeof body === 'string' && body.trim() !== '' ? JSON.parse(body) : body === '' ? {} : body) : undefined,
      ...config,
    });
    console.log(response.data)
    const data = response.data;

    // Check if it's the "app list" - usually these are GetAll calls or returning arrays
    // Also ignore if it's explicitly fetching the dashbaord or something similar that returns a list
    const isAppList = endpoint.toLowerCase().includes('getall') || 
                     endpoint.toLowerCase().includes('gettoken'); // Avoid throwing on token check errors that might be handled differently
    
    if (!isAppList && data && typeof data.status === 'boolean') {
      if (data.status === false) {
        throw new Error(data.message || 'Operation failed');
      }
      // If data.isSuccess is false (another pattern)
    } else if (!isAppList && data && typeof data.isSuccess === 'boolean') {
      if (data.isSuccess === false) {
        throw new Error(data.message || 'Operation failed');
      }
    }

    return data;
  } finally {
    window.dispatchEvent(new CustomEvent('api-fetch-end'));
  }
}

export default api;
