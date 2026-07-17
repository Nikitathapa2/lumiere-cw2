'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const STATUSES = ['pending', 'succeeded', 'failed', 'refunded'];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  succeeded: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
};

const money = (n, c = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: c || 'USD' }).format(n || 0);

const customerOf = (t) => {
  if (t.userId) return `${t.userId.firstName || ''} ${t.userId.lastName || ''}`.trim();
  return t.customerName || 'Guest';
};
const emailOf = (t) => t.userId?.email || t.customerEmail || '—';

function TransactionDetailModal({ id, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/admin/transactions/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => (d.transaction ? setData(d) : setError('Not found')))
      .catch(() => setError('Failed to load transaction.'));
  }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-surface border border-line p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Transaction</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!data && !error && <p className="text-sm text-muted">Loading…</p>}

        {data && (() => {
          const { transaction: t, order } = data;
          const rows = [
            ['Status', <span key="s" className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-sm ${STATUS_COLORS[t.status] || 'bg-line text-muted'}`}>{t.status}</span>],
            ['Amount', money(t.amount, t.currency)],
            ['Provider', t.provider],
            ['Customer', customerOf(t)],
            ['Email', emailOf(t)],
            ['Order #', t.orderNumber || '—'],
            ['Payment Intent', t.paymentIntentId || '—'],
            ['Stripe Session', t.stripeSessionId || '—'],
            ['Created', new Date(t.createdAt).toLocaleString()],
            ['Paid At', t.paidAt ? new Date(t.paidAt).toLocaleString() : '—'],
          ];
          if (t.failureReason) rows.push(['Failure', t.failureReason]);

          return (
            <>
              <dl className="divide-y divide-line border border-line">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                    <dt className="text-[10px] uppercase tracking-widest text-muted pt-0.5">{label}</dt>
                    <dd className="text-xs text-ink text-right break-all max-w-[60%]">{value}</dd>
                  </div>
                ))}
              </dl>

              {order && (
                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-widest text-muted mb-2">Order Items</p>
                  <div className="border border-line divide-y divide-line">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-ink truncate">{item.name}</p>
                          {item.size && <p className="text-[10px] text-muted">Size: {item.size}</p>}
                        </div>
                        <p className="text-xs text-muted">×{item.qty}</p>
                        <p className="text-xs text-ink">{money(item.price * item.qty, t.currency)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [qInput, setQInput] = useState('');
  const [filters, setFilters] = useState({ status: '', from: '', to: '', q: '' });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filters.status) params.set('status', filters.status);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.q) params.set('q', filters.q);
      const res = await fetch(`${API_BASE}/admin/transactions?${params}`, { credentials: 'include' });
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const applyFilters = (e) => {
    e?.preventDefault();
    setPage(1);
    setFilters({ status: statusFilter, from, to, q: qInput });
  };

  const resetFilters = () => {
    setStatusFilter(''); setFrom(''); setTo(''); setQInput('');
    setPage(1);
    setFilters({ status: '', from: '', to: '', q: '' });
  };

  return (
    <div className="space-y-5">
      <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3 bg-surface border border-line p-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted">Search</span>
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Email, name, order #…"
            className="border border-line px-3 py-2 text-sm w-52"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-line px-3 py-2 text-sm bg-surface"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-line px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted">To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-line px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="bg-ink text-white px-4 py-2 text-xs uppercase tracking-widest">Apply</button>
        <button type="button" onClick={resetFilters} className="border border-line px-4 py-2 text-xs uppercase tracking-widest text-muted hover:text-ink">Reset</button>
        <span className="ml-auto text-xs text-muted">{total} transactions</span>
      </form>

      <div className="bg-surface border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg">
              {['Date', 'Customer', 'Email', 'Order #', 'Amount', 'Provider', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted">Loading…</td></tr>}
            {!loading && transactions.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted">No transactions found.</td></tr>
            )}
            {transactions.map((t) => (
              <tr key={t._id} className="border-b border-line last:border-0 hover:bg-bg transition-colors cursor-pointer" onClick={() => setSelected(t._id)}>
                <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-xs text-ink-soft">{customerOf(t)}</td>
                <td className="px-4 py-3 text-xs text-muted">{emailOf(t)}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink">{t.orderNumber || '—'}</td>
                <td className="px-4 py-3 text-xs text-ink">{money(t.amount, t.currency)}</td>
                <td className="px-4 py-3 text-xs text-muted capitalize">{t.provider}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-sm ${STATUS_COLORS[t.status] || 'bg-line text-muted'}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3 text-[10px] uppercase tracking-widest text-ink-soft">View →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs border border-line disabled:opacity-40 hover:bg-bg">←</button>
          <span className="text-xs text-muted">Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs border border-line disabled:opacity-40 hover:bg-bg">→</button>
        </div>
      )}

      {selected && <TransactionDetailModal id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
