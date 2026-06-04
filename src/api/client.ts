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
      if (!window.location.pathname.includes('login')) {
         window.location.reload();
      }
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
    return response.data;
  } finally {
    window.dispatchEvent(new CustomEvent('api-fetch-end'));
  }
}

export default api;
