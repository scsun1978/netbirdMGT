'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useEffect } from 'react';

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    setAuth,
    logout,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser && !isAuthenticated) {
        try {
          const user = JSON.parse(savedUser);
          setAuth(user, savedToken);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  }, [isAuthenticated, setAuth]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const { user, token } = await response.json();

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      setAuth(user, token);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    logout();
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
  };
}
