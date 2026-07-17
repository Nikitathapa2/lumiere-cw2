'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '@/lib/api';

const CartContext = createContext(null);
const STORAGE_KEY = 'lumiere.cart.v1';
export const TAX_RATE = 0.08;

function promoDiscount(promo, subtotal) {
  if (!promo) return 0;
  if (promo.type === 'percent') return (subtotal * promo.value) / 100;
  if (promo.type === 'fixed') return Math.min(promo.value, subtotal);
  return 0;
}

const lineKey = (item) => `${item.slug}__${item.size || ''}__${item.color || ''}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const [promo, setPromo] = useState(null);

  const clear = useCallback(() => {
    setItems([]);
    setPromo(null);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onSignout = () => clear();
    if (typeof window !== 'undefined') {
      window.addEventListener('lumiere:signout', onSignout);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lumiere:signout', onSignout);
      }
    };
  }, [clear]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item, qty = 1) => {
    const key = lineKey(item);
    setItems((prev) => {
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) => (lineKey(i) === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
    setLastAdded({ ...item, qty });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== key));
  }, []);

  const updateQty = useCallback((key, qty) => {
    setItems((prev) =>
      prev.map((i) => (lineKey(i) === key ? { ...i, qty: Math.max(1, qty) } : i))
    );
  }, []);

  

  const applyPromo = useCallback(async (code) => {
    try {
      const result = await api.applyPromo(code);
      setPromo(result);
      return { ok: true, message: `Code ${result.code} applied.` };
    } catch (err) {
      setPromo(null);
      return { ok: false, message: err.message || 'Invalid code.' };
    }
  }, []);

  const removePromo = useCallback(() => setPromo(null), []);

  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => ({
        count: acc.count + i.qty,
        subtotal: acc.subtotal + i.price * i.qty,
      }),
      { count: 0, subtotal: 0 }
    );
  }, [items]);

  const discount = useMemo(() => promoDiscount(promo, subtotal), [promo, subtotal]);
  const total = Math.max(0, subtotal - discount);
  const round2 = (n) => Math.round(n * 100) / 100;
  const tax = round2(Math.max(0, subtotal - discount) * TAX_RATE);
  const grandTotal = round2(Math.max(0, subtotal - discount) + tax);

  const orderItems = useMemo(
    () => items.map(({ slug, size, color, qty }) => ({ slug, size, color, qty })),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      hydrated,
      count,
      subtotal,
      discount,
      total,
      tax,
      grandTotal,
      orderItems,
      promo,
      applyPromo,
      removePromo,
      addItem,
      removeItem,
      updateQty,
      clear,
      lineKey,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      lastAdded,
    }),
    [
      items,
      hydrated,
      count,
      subtotal,
      discount,
      total,
      tax,
      grandTotal,
      orderItems,
      promo,
      applyPromo,
      removePromo,
      addItem,
      removeItem,
      updateQty,
      clear,
      drawerOpen,
      lastAdded,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
