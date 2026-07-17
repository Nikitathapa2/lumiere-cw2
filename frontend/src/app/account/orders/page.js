'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';

const STATUS_LABELS = {
  placed: 'Placed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { orders: list } = await api.getMyOrders();
        setOrders(list);
      } catch {
        setOrders([]);
      }
    })();
  }, []);

  if (orders === null) return <div className="min-h-[30vh]" aria-hidden />;

  return (
    <section>
      <h2 className="font-serif text-2xl">Order History</h2>

      {orders.length === 0 ? (
        <div className="mt-6 flex flex-col items-start gap-5">
          <p className="text-sm text-ink-soft">You haven’t placed any orders yet.</p>
          <Button href="/collections" variant="primary">Explore the Collection</Button>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {orders.map((order) => (
            <li key={order._id}>
              <Link
                href={`/account/orders/${order._id}`}
                className="flex items-center justify-between gap-4 py-5 transition-opacity hover:opacity-70"
              >
                <div>
                  <p className="font-medium tracking-wide text-ink">{order.orderNumber}</p>
                  <p className="u-label mt-1 text-muted">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    · {order.items.reduce((n, i) => n + i.qty, 0)} items
                  </p>
                </div>
                <div className="text-right">
                  <Price value={order.total} className="text-sm text-ink" />
                  <p className="u-label mt-1 text-accent">
                    {STATUS_LABELS[order.status] || order.status}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
