"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RequireAuth({ children, redirectTo = '/login' }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const url = new URL(window.location.href);
      const dest = `${redirectTo}?redirect=${encodeURIComponent(url.pathname)}`;
      router.push(dest);
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  if (loading || !isAuthenticated) return null;
  return children;
}
