'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import StepUpModal from '@/components/auth/StepUpModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function KpiCard({ icon, label, value, sub }) {
  return (
    <div className="bg-surface border border-line p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
        <span className="material-symbols-outlined text-muted" style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <p className="mt-3 font-serif text-3xl text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [needsStepUp, setNeedsStepUp] = useState(false);
  const [loading, setLoading] = useState(true);

  const stats = data?.stats ?? { totalUsers: 0, totalOrders: 0, totalProducts: 0, revenue: 0 };
  const recentOrders = data?.recentOrders ?? [];

  const loadStats = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = await api.adminGetStats();
      if (!payload?.stats) {
        throw new Error('Failed to load stats.');
      }
      setData(payload);
    } catch (err) {
      if (err.code === 'STEP_UP_REQUIRED') {
        setNeedsStepUp(true);
        return;
      }
      setError(err.message || 'Failed to load stats. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (loading && !data) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon="group" label="Customers" value={stats.totalUsers.toLocaleString()} />
        <KpiCard icon="receipt_long" label="Orders" value={stats.totalOrders.toLocaleString()} />
        <KpiCard icon="inventory_2" label="Products" value={stats.totalProducts.toLocaleString()} sub="in stock" />
        <KpiCard
          icon="payments"
          label="Revenue"
          value={`$${Math.round(stats.revenue).toLocaleString()}`}
          sub="all time"
        />
      </div>

      <div className="bg-surface border border-line">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink">Recent Orders</h2>
          <Link href="/admin/orders" className="text-[10px] uppercase tracking-widest text-muted hover:text-ink">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg">
                {['Order #', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted">No orders yet.</td>
                </tr>
              )}
              {recentOrders.map((o) => (
                <tr key={o._id} className="border-b border-line last:border-0 hover:bg-bg transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-ink">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-xs text-ink-soft">
                    {o.shippingAddress?.firstName} {o.shippingAddress?.lastName}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink">${o.total?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-sm ${STATUS_COLORS[o.status] || 'bg-line text-muted'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {needsStepUp && (
        <StepUpModal
          onGranted={async () => {
            setNeedsStepUp(false);
            await loadStats();
          }}
          onCancel={() => setNeedsStepUp(false)}
        />
      )}
    </div>
  );
}
