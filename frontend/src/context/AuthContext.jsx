'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { api, safe } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await safe(api.me(), { user: null });
      setUser(res?.user || null);
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    if (res.mfaRequired) return res;
    setUser(res.user);
    return res.user;
  }, []);

  const verifyMfa = useCallback(async (challenge, { token, recoveryCode } = {}) => {
    const { user: u } = await api.verifyMfa({ challenge, token, recoveryCode });
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: u } = await api.register(payload);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await safe(api.logout(), null);
    setUser(null);
    try {
      localStorage.removeItem('lumiere.cart.v1');
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('lumiere:signout'));
    }
  }, []);

  const refresh = useCallback(async () => {
    const res = await safe(api.me(), { user: null });
    setUser(res?.user || null);
    return res?.user || null;
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, login, verifyMfa, register, logout, refresh, setUser }),
    [user, loading, login, verifyMfa, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
