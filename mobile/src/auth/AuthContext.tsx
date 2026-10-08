import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { UserResponse, LoginInput, RegisterInput } from '@taskforge/shared';
import { authApi } from '../api/auth';
import { secureStorage } from './secureStorage';
import { setSessionExpiredHandler } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

interface AuthContextValue {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  sessionExpiredMessage: string | null;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearSessionExpiredMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  // On App Mount: Read token from SecureStore and validate with GET /auth/me
  useEffect(() => {
    let isMounted = true;

    async function hydrateAuth() {
      try {
        const storedToken = await secureStorage.getToken();
        if (!storedToken) {
          if (isMounted) {
            setUser(null);
            setToken(null);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setToken(storedToken);
        }

        // Validate token with backend
        const currentUser = await authApi.getMe();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        // If /auth/me fails (invalid or expired token), clear local token
        await secureStorage.deleteToken();
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hook up 401 Session Expiration Handler from Axios interceptor
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setToken(null);
      setSessionExpiredMessage('Your session expired, please log in again.');
      queryClient.clear();
      router.replace('/(auth)/login');
    });
  }, [queryClient, router]);

  async function login(credentials: LoginInput) {
    const res = await authApi.login(credentials);
    await secureStorage.setToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setSessionExpiredMessage(null);
  }

  async function register(data: RegisterInput) {
    const res = await authApi.register(data);
    await secureStorage.setToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setSessionExpiredMessage(null);
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Best effort backend logout call
    } finally {
      await secureStorage.deleteToken();
      queryClient.clear();
      setUser(null);
      setToken(null);
      setSessionExpiredMessage(null);
    }
  }

  function clearSessionExpiredMessage() {
    setSessionExpiredMessage(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      sessionExpiredMessage,
      login,
      register,
      logout,
      clearSessionExpiredMessage,
    }),
    [user, token, isLoading, sessionExpiredMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
