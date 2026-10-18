import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserInfo } from '@/types/api';
import {
  getUser as getUserFromStorage,
  setUser as saveUser,
  clearUser,
  getMe,
} from '../api/auth';
import { getToken, setToken as saveToken, clearToken } from '../api/token';
import { logger } from '../api';

interface AuthContextValue {
  user: UserInfo | null;
  loading: boolean;
  login: (user: UserInfo, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUserFromStorage();
    const token = getToken();
    if (storedUser && token) {
      setUserState(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData: UserInfo, token: string) => {
    saveToken(token);
    saveUser(userData);
    setUserState(userData);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearUser();
    setUserState(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      saveUser(me);
      setUserState(me);
    } catch (error) {
      logger.error('刷新用户信息失败', error);
      clearToken();
      clearUser();
      setUserState(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isLoggedIn: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
