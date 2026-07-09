const API_URL =
  (typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:5000/api';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function csrfHeader() {
  const token = readCookie('lumiere_csrf');
  return token ? { 'X-CSRF-Token': token } : {};
}


export async function ensureCsrfToken() {
  if (typeof document === 'undefined') return;
  if (readCookie('lumiere_csrf')) return;
  try {
    await fetch(`${API_URL}/csrf-token`, { credentials: 'include' });
  } catch {
  }
}

async function request(path, { params, ...options } = {}) {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const method = (options.method || 'GET').toUpperCase();
  const unsafe = UNSAFE_METHODS.has(method);
  if (unsafe) await ensureCsrfToken();

  const res = await fetch(url, {
    credentials: 'include',
    next: { revalidate: 60 },
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(unsafe ? csrfHeader() : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let code = null;
    try {
      const body = await res.json();
      message = body.message || message;
      code = body.code || null;
    } catch {
    }
    const error = new Error(message);
    error.status = res.status;
    error.code = code;
    throw error;
  }

  return res.json();
}

export const api = {
  // Products
  getProducts: (params) => request('/products', { params }),
  getNewArrivals: (limit = 4) => request('/products/new-arrivals', { params: { limit } }),
  getProduct: (slug) => request(`/products/${slug}`),
  // Collections
  getCollections: (params) => request('/collections', { params }),
  getCollection: (slug) => request(`/collections/${slug}`),
  // Sale
  getSaleProducts: (params) => request('/products', { params: { ...params, onSale: 'true' } }),
  // Categories
  getCategories: () => request('/categories'),
  // Cart
  applyPromo: (code) =>
    request('/cart/promo', { method: 'POST', body: JSON.stringify({ code }), cache: 'no-store' }),
  // Orders
  createOrder: (payload) =>
    request('/orders', { method: 'POST', body: JSON.stringify(payload), cache: 'no-store' }),
  getOrder: (id, token) =>
    request(`/orders/${id}`, { params: token ? { t: token } : undefined, cache: 'no-store' }),
  getMyOrders: () => request('/orders', { cache: 'no-store' }),
  // Checkout (Stripe)
  createCheckoutSession: (payload) =>
    request('/checkout/session', { method: 'POST', body: JSON.stringify(payload), cache: 'no-store' }),
  verifyCheckout: (sessionId) =>
    request('/checkout/verify', { params: { session_id: sessionId }, cache: 'no-store' }),
  // Auth
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload), cache: 'no-store' }),
  login: (payload) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(payload), cache: 'no-store' }),
  logout: () => request('/auth/logout', { method: 'POST', cache: 'no-store' }),
  // MFA (TOTP)
  verifyMfa: (payload) =>
    request('/auth/mfa/verify', { method: 'POST', body: JSON.stringify(payload), cache: 'no-store' }),
  setupMfa: () => request('/auth/mfa/setup', { method: 'POST', cache: 'no-store' }),
  enableMfa: (token) =>
    request('/auth/mfa/enable', { method: 'POST', body: JSON.stringify({ token }), cache: 'no-store' }),
  disableMfa: () => request('/auth/mfa/disable', { method: 'POST', cache: 'no-store' }),
  // OAuth2 — Google SSO (full-page redirect, not a fetch call)
  googleOAuthUrl: () => `${API_URL}/auth/oauth/google`,
  me: () => request('/auth/me', { cache: 'no-store' }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }), cache: 'no-store' }),
  resetPassword: (token, password) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      cache: 'no-store',
    }),
  // Account (protected)
  updateProfile: (payload) =>
    request('/auth/me', { method: 'PATCH', body: JSON.stringify(payload), cache: 'no-store' }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
      cache: 'no-store',
    }),
  getAddresses: () => request('/auth/addresses', { cache: 'no-store' }),
  addAddress: (payload) =>
    request('/auth/addresses', { method: 'POST', body: JSON.stringify(payload), cache: 'no-store' }),
  updateAddress: (id, payload) =>
    request(`/auth/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(payload), cache: 'no-store' }),
  deleteAddress: (id) =>
    request(`/auth/addresses/${id}`, { method: 'DELETE', cache: 'no-store' }),
  // Wishlist (protected)
  getWishlist: () => request('/auth/wishlist', { cache: 'no-store' }),
  addWishlist: (slug) =>
    request('/auth/wishlist', { method: 'POST', body: JSON.stringify({ slug }), cache: 'no-store' }),
  removeWishlist: (slug) =>
    request(`/auth/wishlist/${slug}`, { method: 'DELETE', cache: 'no-store' }),
  mergeWishlist: (slugs) =>
    request('/auth/wishlist/merge', { method: 'POST', body: JSON.stringify({ slugs }), cache: 'no-store' }),
  // Notifications (protected)
  getNotifications: () => request('/notifications', { cache: 'no-store' }),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, { method: 'PATCH', cache: 'no-store' }),
  markAllNotificationsRead: () =>
    request('/notifications/read-all', { method: 'POST', cache: 'no-store' }),
  // Admin (admin role required)
  adminGetStats: () => request('/admin/stats', { cache: 'no-store' }),
  adminListUsers: (params) => request('/admin/users', { params, cache: 'no-store' }),
  adminGetUser: (id) => request(`/admin/users/${id}`, { cache: 'no-store' }),
  adminUpdateUser: (id, payload) =>
    request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload), cache: 'no-store' }),
  adminDeleteUser: (id) =>
    request(`/admin/users/${id}`, { method: 'DELETE', cache: 'no-store' }),
  adminListOrders: (params) => request('/admin/orders', { params, cache: 'no-store' }),
  adminGetOrder: (id) => request(`/admin/orders/${id}`, { cache: 'no-store' }),
  adminUpdateOrder: (id, payload) =>
    request(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(payload), cache: 'no-store' }),
  adminDeleteOrder: (id) =>
    request(`/admin/orders/${id}`, { method: 'DELETE', cache: 'no-store' }),
  adminGetWallet: (params) => request('/admin/wallet', { params, cache: 'no-store' }),
  adminListTransactions: (params) => request('/admin/transactions', { params, cache: 'no-store' }),
  adminGetTransaction: (id) => request(`/admin/transactions/${id}`, { cache: 'no-store' }),
  // Sessions + step-up (Batch 20)
  getSessions: () => request('/account/sessions', { cache: 'no-store' }),
  revokeSession: (id) =>
    request(`/account/sessions/${id}`, { method: 'DELETE', cache: 'no-store' }),
  revokeAllSessions: () =>
    request('/account/sessions', { method: 'DELETE', cache: 'no-store' }),
  stepUp: (password) =>
    request('/account/sessions/step-up', {
      method: 'POST',
      body: JSON.stringify({ password }),
      cache: 'no-store',
    }),
  // Health
  health: () => request('/health'),
};

export async function safe(promise, fallback) {
  try {
    return await promise;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[api] request failed, using fallback:', err.message);
    }
    return fallback;
  }
}

function mockRating(slug) {
  let h = 0;
  for (let i = 0; i < (slug?.length || 0); i++) {
    h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0;
  }
  h = Math.abs(h);
  return {
    rating: +((3.5 + (h % 16) / 10).toFixed(1)),
    reviewCount: 8 + (h % 80),
  };
}

export function toCardProduct(p) {
  const mock = mockRating(p.slug);
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice || null,
    image: p.images?.[0] || null,
    subLabel: p.subLabel || '',
    isNewArrival: p.isNewArrival || false,
    rating: p.rating ?? mock.rating,
    reviewCount: p.reviewCount ?? mock.reviewCount,
  };
}
