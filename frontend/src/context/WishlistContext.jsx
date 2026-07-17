'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { api, safe } from '@/lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'lumiere.wishlist.v1';

export function WishlistProvider({ children }) {
  const { user, loading } = useAuth();
  const [slugs, setSlugs] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const syncedFor = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSlugs(JSON.parse(raw));
    } catch {
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, [slugs, hydrated]);

  useEffect(() => {
    if (loading || !hydrated) return;
    if (user && syncedFor.current !== user._id) {
      syncedFor.current = user._id;
      (async () => {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const res = await safe(api.mergeWishlist(local), null);
        if (res?.slugs) setSlugs(res.slugs);
      })();
    }
    if (!user) syncedFor.current = null;
  }, [user, loading, hydrated]);

  const has = useCallback((slug) => slugs.includes(slug), [slugs]);

  const toggle = useCallback(
    (slug) => {
      setSlugs((prev) => {
        const active = prev.includes(slug);
        const next = active ? prev.filter((s) => s !== slug) : [...prev, slug];
        if (user) safe(active ? api.removeWishlist(slug) : api.addWishlist(slug), null);
        return next;
      });
    },
    [user]
  );

  const remove = useCallback(
    (slug) => {
      setSlugs((prev) => prev.filter((s) => s !== slug));
      if (user) safe(api.removeWishlist(slug), null);
    },
    [user]
  );

  const value = useMemo(
    () => ({ slugs, count: slugs.length, hydrated, has, toggle, remove }),
    [slugs, hydrated, has, toggle, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
