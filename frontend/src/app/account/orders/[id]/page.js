'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Price from '@/components/ui/Price';
import Divider from '@/components/ui/Divider';
import { ChevronLeftIcon } from '@/components/icons';

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    (async () => {
      try {
        const { order: o } = await api.getOrder(id);
        setOrder(o);
      } catch {
        setOrder(null);
      }
    })();
  }, [id]);

  if (order === undefined) return <div className="min-h-[30vh]" aria-hidden />;

  if (!order) {
    return (
      <section>
        <p className="text-sm text-ink-soft">Order not found.</p>
        <Link href="/account/orders" className="u-link mt-4 inline-flex border-ink">
          Back to Orders
        </Link>
      </section>
    );
  }

  const addr = order.shippingAddress;

  return (
    <section className="max-w-xl">
      <Link href="/account/orders" className="u-label inline-flex items-center gap-1 text-muted hover:text-ink">
        <ChevronLeftIcon size={14} /> Order History
      </Link>

      <div className="mt-5 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl">{order.orderNumber}</h2>
        <span className="u-label text-accent">{order.status}</span>
      </div>
      <p className="u-label mt-2 text-muted">
        {new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <div className="mt-8 border border-line bg-surface p-6">
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={`${item.slug}-${item.size}`} className="flex justify-between text-sm">
              <span className="text-ink">
                {item.name}
                <span className="text-muted">
                  {' '}×{item.qty}{item.size ? ` · ${item.size}` : ''}
                </span>
              </span>
              <Price value={item.price * item.qty} className="text-ink-soft" />
            </li>
          ))}
        </ul>

        <Divider className="my-5" />

        <dl className="space-y-2 text-sm">
          <Row label="Subtotal"><Price value={order.subtotal} /></Row>
          {order.discount > 0 ? (
            <Row label={`Discount${order.promoCode ? ` (${order.promoCode})` : ''}`}>
              <span className="text-accent">−<Price value={order.discount} /></span>
            </Row>
          ) : null}
          <Row label="Shipping"><span className="text-accent">Complimentary</span></Row>
          <Row label="Tax"><Price value={order.tax} /></Row>
        </dl>

        <Divider className="my-5" />

        <div className="flex items-baseline justify-between">
          <span className="u-label text-ink">Total</span>
          <Price value={order.total} serif className="text-xl" />
        </div>
      </div>

      <div className="mt-6 text-sm text-ink-soft">
        <p className="u-label mb-2 text-muted">Shipping To</p>
        <p>{addr.firstName} {addr.lastName}</p>
        <p>{addr.address}</p>
        <p>{addr.city}, {addr.postalCode}</p>
        <p>{addr.country}</p>
      </div>
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
