import axios from 'axios';
import { API_BASE_URL } from '../config';
import { clearBrowserId, getBrowserId } from '../utils/browserId';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*',
  },
});

// Add a request interceptor to include JWT and X-Browser-Id headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Don't add token to login request
    const isLoginRequest = config.url?.includes('/User/Login');
    const isGetBrowserIdRequest = config.url?.includes('/User/GetBrowserId');
    const existingAuth = config.headers?.['Authorization'] || config.headers?.['authorization'];

    if (token && !isLoginRequest && config.headers && !existingAuth) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const browserId = getBrowserId();
    if (!isLoginRequest && !isGetBrowserIdRequest && (token || existingAuth) && browserId && config.headers) {
      config.headers['X-Browser-Id'] = browserId;
    }

    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
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
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('roleName');
      clearBrowserId();
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
  const isGetBrowserIdRequest = endpoint.includes('/User/GetBrowserId');
  
  const finalHeaders = { ...headers };
  const hasExplicitAuth = Boolean(finalHeaders['Authorization'] || finalHeaders['authorization']);

  if (token && !isLoginRequest && !hasExplicitAuth) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }
  const browserId = getBrowserId();
  if (!isLoginRequest && !isGetBrowserIdRequest && (token || hasExplicitAuth) && browserId) {
    finalHeaders['X-Browser-Id'] = browserId;
  }
  if (body instanceof FormData) {
    delete finalHeaders['Content-Type'];
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
