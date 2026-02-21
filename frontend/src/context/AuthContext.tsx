import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as authApi from '../api/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const u = await authApi.login(credentials.email, credentials.password);
    setUser({ id: u.id, email: u.email, name: u.name, role: u.role });
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      role: string;
      confirmPassword: string;
    }) => {
      const u = await authApi.register(data);
      setUser({ id: u.id, email: u.email, name: u.name, role: u.role });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    authApi
      .getMe()
      .then((u) => {
        if (!cancelled) setUser({ id: u.id, email: u.email, name: u.name, role: u.role });
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
