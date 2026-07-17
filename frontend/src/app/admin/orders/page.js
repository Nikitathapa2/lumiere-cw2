'use client';

import { useState, useEffect, useCallback } from 'react';
import { csrfHeader, ensureCsrfToken } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function OrderDetailModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (status === order.status) { onClose(); return; }
    setSaving(true);
    setError('');
    try {
      await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/admin/orders/${order._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeader() },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      onUpdate(data.order);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-surface border border-line p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest">Order Detail</h2>
            <p className="text-xs text-muted font-mono mt-0.5">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="border border-line divide-y divide-line mb-5">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink">{item.name}</p>
                {item.size && <p className="text-[10px] text-muted">Size: {item.size}</p>}
              </div>
              <p className="text-xs text-muted">×{item.qty}</p>
              <p className="text-xs text-ink">${(item.price * item.qty).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 text-xs mb-5">
          <div className="flex justify-between text-muted"><span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-muted"><span>Discount</span><span>-${order.discount?.toFixed(2)}</span></div>}
          <div className="flex justify-between text-muted"><span>Tax</span><span>${order.tax?.toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold text-ink border-t border-line pt-1.5 mt-1.5">
            <span>Total</span><span>${order.total?.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-line pt-4 mb-5">
          <p className="text-[10px] uppercase tracking-widest text-muted mb-2">Shipping Address</p>
          <p className="text-xs text-ink-soft leading-relaxed">
            {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}<br />
            {order.shippingAddress?.address}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
            {order.shippingAddress?.country}
          </p>
        </div>

        <div className="border-t border-line pt-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted">Update Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full border border-line px-3 py-2 text-sm bg-surface"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </label>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="mt-3 w-full bg-ink text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-ink/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Update Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('q', search);
      const res = await fetch(`${API_BASE}/admin/orders?${params}`, { credentials: 'include' });
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
    }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q);
  };

  const handleDelete = async (id) => {
    try {
      await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/admin/orders/${id}`, { method: 'DELETE', credentials: 'include', headers: { ...csrfHeader() } });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
        setTotal((t) => t - 1);
      }
    } catch {}
    setDeleteConfirm(null);
  };

  const handleUpdate = (updated) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order number…"
            className="flex-1 border border-line px-3 py-2 text-sm min-w-0"
          />
          <button type="submit" className="bg-ink text-white px-4 py-2 text-xs uppercase tracking-widest">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-line px-3 py-2 text-sm bg-surface"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <span className="text-xs text-muted">{total} orders</span>
      </div>

      <div className="bg-surface border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg">
              {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted">Loading…</td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted">No orders found.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-line last:border-0 hover:bg-bg transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-ink">{o.orderNumber}</td>
                <td className="px-4 py-3 text-xs text-ink-soft">
                  {o.shippingAddress?.firstName} {o.shippingAddress?.lastName}
                </td>
                <td className="px-4 py-3 text-xs text-muted">{o.items?.length}</td>
                <td className="px-4 py-3 text-xs text-ink">${o.total?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-sm ${STATUS_COLORS[o.status] || 'bg-line text-muted'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-sm ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-line text-muted'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelected(o)} className="text-[10px] uppercase tracking-widest text-ink-soft hover:text-ink">
                      Manage
                    </button>
                    <button onClick={() => setDeleteConfirm(o._id)} className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs border border-line disabled:opacity-40 hover:bg-bg">
            ←
          </button>
          <span className="text-xs text-muted">Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs border border-line disabled:opacity-40 hover:bg-bg">
            →
          </button>
        </div>
      )}

      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm bg-surface border border-line p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest">Delete Order?</h2>
            <p className="text-sm text-ink-soft">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white px-4 py-2 text-xs uppercase tracking-widest">
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-line px-4 py-2 text-xs uppercase tracking-widest">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
