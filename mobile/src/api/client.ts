import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../auth/secureStorage';
import { AppError } from '../utils/error';

import Constants from 'expo-constants';

declare const process: any;

function resolveApiUrl(): string {
  // 1. Use explicit environment variable if provided (e.g. physical device or deployment)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Auto-detect host IP when running via Expo Go / Metro
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).expoGoConfig?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('ngrok')) {
      return `http://${host}:5000`;
    }
  }

  // 3. Fallback for Android emulator
  return 'http://10.0.2.2:5000';
}

const API_URL = resolveApiUrl();
console.log(`[Taskora Mobile] API base URL: ${API_URL}/api`);

export interface BackendErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
}

let onSessionExpiredCallback: (() => void) | null = null;
let isHandlingExpiry = false;

export function setSessionExpiredHandler(callback: () => void) {
  onSessionExpiredCallback = callback;
}

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer token from SecureStore
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize errors & manage 401 session expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BackendErrorResponse>) => {
    // 1. Network error / Timeout (no response from server)
    if (!error.response) {
      throw new AppError(
        'NETWORK_ERROR',
        'No internet connection. Check your network and try again.'
      );
    }

    const { status, data } = error.response;

    // 2. 401 Unauthorized / TOKEN_EXPIRED
    // Global Error Interception: 
    // Trap any 401 response universally across the app. We clear the secure token 
    // and fire the callback to redirect the user to the Login screen.
    if (status === 401) {
      if (!isHandlingExpiry) {
        isHandlingExpiry = true;
        try {
          await secureStorage.deleteToken();
          if (onSessionExpiredCallback) {
            onSessionExpiredCallback();
          }
        } finally {
          // Release mutex after redirect has occurred
          setTimeout(() => {
            isHandlingExpiry = false;
          }, 2000);
        }
      }

      throw new AppError(
        data?.error?.code || 'UNAUTHORIZED',
        data?.error?.message || 'Your session expired, please log in again.',
        data?.error?.details,
        401
      );
    }

    // 3. Other normalized backend errors
    const code = data?.error?.code || `HTTP_${status}`;
    const message = data?.error?.message || error.message || 'Request failed';
    const details = data?.error?.details;

    throw new AppError(code, message, details, status);
  }
);
