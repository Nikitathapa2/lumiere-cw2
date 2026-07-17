'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

function KpiCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-surface border border-line p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
        <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <p className={`mt-3 font-serif text-3xl ${accent || 'text-ink'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function RevenueChart({ series }) {
  if (!series.length) {
    return <p className="text-sm text-muted px-5 py-8 text-center">No revenue in this range.</p>;
  }
  const max = Math.max(...series.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-1.5 h-48 px-5 py-4 overflow-x-auto">
      {series.map((d) => (
        <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-[28px] group">
          <span className="text-[9px] text-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {money(d.amount)}
          </span>
          <div
            className="w-full bg-ink/80 hover:bg-ink transition-colors"
            style={{ height: `${Math.max(2, (d.amount / max) * 100)}%` }}
            title={`${d.date}: ${money(d.amount)} (${d.count})`}
          />
          <span className="text-[9px] text-muted whitespace-nowrap">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminWalletPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filters, setFilters] = useState({ from: '', to: '' });

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      const res = await fetch(`${API_BASE}/admin/wallet?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setError(null);
    } catch {
      setError('Failed to load wallet. Make sure you are logged in as admin.');
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  const apply = (e) => { e.preventDefault(); setFilters({ from, to }); };
  const reset = () => { setFrom(''); setTo(''); setFilters({ from: '', to: '' }); };

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (loading || !data) return <p className="text-sm text-muted">Loading…</p>;

  const { wallet, series } = data;
  const { byStatus } = wallet;

  return (
    <div className="space-y-8">
      <form onSubmit={apply} className="flex flex-wrap items-end gap-3 bg-surface border border-line p-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-line px-3 py-2 text-sm" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-muted">To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-line px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="bg-ink text-white px-4 py-2 text-xs uppercase tracking-widest">Apply</button>
        <button type="button" onClick={reset} className="border border-line px-4 py-2 text-xs uppercase tracking-widest text-muted hover:text-ink">Reset</button>
        <Link href="/admin/transactions" className="ml-auto text-[10px] uppercase tracking-widest text-muted hover:text-ink self-center">
          All transactions →
        </Link>
      </form>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon="account_balance_wallet" label="Net Revenue" value={money(wallet.netRevenue)} sub="succeeded − refunded" accent="text-ink" />
        <KpiCard icon="trending_up" label="Gross Revenue" value={money(wallet.revenue)} sub={`${byStatus.succeeded.count} payments`} />
        <KpiCard icon="undo" label="Refunded" value={money(wallet.refunded)} sub={`${byStatus.refunded.count} refunds`} accent="text-red-600" />
        <KpiCard icon="receipt_long" label="Transactions" value={wallet.totalCount.toLocaleString()} sub="in range" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Succeeded', 'succeeded', 'text-green-700'],
          ['Pending', 'pending', 'text-yellow-700'],
          ['Failed', 'failed', 'text-red-700'],
          ['Refunded', 'refunded', 'text-blue-700'],
        ].map(([label, key, color]) => (
          <div key={key} className="bg-surface border border-line p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted">{label}</p>
            <p className={`mt-1 text-lg font-semibold ${color}`}>{byStatus[key].count}</p>
            <p className="text-xs text-muted">{money(byStatus[key].amount)}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-line">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink">Daily Revenue (succeeded)</h2>
        </div>
        <RevenueChart series={series} />
      </div>
    </div>
  );
}
