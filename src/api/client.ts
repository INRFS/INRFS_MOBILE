import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENV} from '../config/env';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  INVESTOR_ID: 'investor_id',
};

// Listeners for 401 / session expiry
type AuthListener = () => void;
const sessionExpiryListeners: Set<AuthListener> = new Set();

export const onSessionExpired = (listener: AuthListener) => {
  sessionExpiryListeners.add(listener);
  return () => {
    sessionExpiryListeners.delete(listener);
  };
};

export const triggerSessionExpired = () => {
  sessionExpiryListeners.forEach(listener => {
    try {
      listener();
    } catch (e) {
      console.warn('Session expiry listener error:', e);
    }
  });
};

/**
 * Format backend error responses safely into human-readable strings.
 */
export const formatErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (typeof error === 'string') return error;

  // Axios response error
  if (error.response) {
    const data = error.response.data;
    const status = error.response.status;

    if (status === 401) {
      return 'Session expired or authentication failed. Please login again.';
    }

    if (data) {
      if (typeof data === 'string' && data.trim()) {
        return data.trim();
      }

      if (Array.isArray(data.detail)) {
        return data.detail
          .map((item: any) => item?.msg || item?.message || String(item))
          .join(', ');
      }

      if (typeof data.detail === 'string' && data.detail.trim()) {
        return data.detail.trim();
      }

      if (data.message && typeof data.message === 'string') {
        return data.message;
      }

      if (data.error && typeof data.error === 'string') {
        return data.error;
      }
    }

    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'Requested resource was not found.';
    if (status === 409) return 'Conflict detected with current state.';
    if (status === 422) return 'Validation error. Please check your inputs.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status >= 500) return 'Server error. Please try again later.';

    return `Request failed with status code ${status}.`;
  }

  // Network or timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Connection timed out. Please check your internet connection.';
  }

  if (error.message === 'Network Error' || !error.response) {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  return error.message || 'An unexpected error occurred.';
};

/**
 * Centralized Axios client
 */
export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token =
        (await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)) ||
        (await AsyncStorage.getItem('accessToken')) ||
        (await AsyncStorage.getItem('token'));

      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (err) {
      console.warn('Error reading token for request interceptor:', err);
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response Interceptor: Handle 401 and parse clean errors
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        const keys = [
          TOKEN_KEYS.ACCESS_TOKEN,
          TOKEN_KEYS.REFRESH_TOKEN,
          TOKEN_KEYS.USER_INFO,
          TOKEN_KEYS.INVESTOR_ID,
          'accessToken',
          'token',
        ];
        await Promise.all(keys.map(k => AsyncStorage.removeItem(k)));
        triggerSessionExpired();
      } catch (err) {
        console.warn('Error clearing tokens on 401:', err);
      }
    }

    const cleanMessage = formatErrorMessage(error);
    const customError = new Error(cleanMessage);
    (customError as any).originalError = error;
    (customError as any).status = error.response?.status;
    (customError as any).data = error.response?.data;

    return Promise.reject(customError);
  },
);

export default apiClient;
