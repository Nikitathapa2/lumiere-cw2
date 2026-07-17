'use client';

import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import Price from '@/components/ui/Price';
import Divider from '@/components/ui/Divider';
import PromoCode from '@/components/cart/PromoCode';

export default function OrderSummary() {
  const { items, subtotal, discount, tax, grandTotal, promo } = useCart();

  return (
    <div className="border border-line bg-surface p-6 md:p-7">
      <h2 className="font-serif text-xl">Order Summary</h2>

      <ul className="mt-5 space-y-5">
        {items.map((item) => {
          const variant = [item.size ? `Size ${item.size}` : null, item.color]
            .filter(Boolean)
            .join(' | ');
          return (
            <li key={`${item.slug}-${item.size}-${item.color}`} className="flex gap-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-bg">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-sm font-semibold uppercase leading-snug text-ink">{item.name}</h3>
                {variant ? <p className="u-label mt-1 text-muted">{variant}</p> : null}
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-xs text-muted">Qty {item.qty}</span>
                  <Price value={item.price * item.qty} className="text-sm text-ink" />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Divider className="my-5" />

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="u-label text-ink-soft">Subtotal</dt>
          <dd><Price value={subtotal} className="text-ink" /></dd>
        </div>
        {promo && discount > 0 ? (
          <div className="flex justify-between">
            <dt className="u-label text-ink-soft">Discount ({promo.code})</dt>
            <dd className="text-accent">−<Price value={discount} /></dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="u-label text-ink-soft">Shipping</dt>
          <dd className="font-medium text-accent">Complimentary</dd>
        </div>
        <div className="flex justify-between">
          <dt className="u-label text-ink-soft">Estimated Tax</dt>
          <dd><Price value={tax} className="text-ink" /></dd>
        </div>
      </dl>

      <Divider className="my-5" />

      <div className="flex items-baseline justify-between">
        <span className="u-label text-ink">Total</span>
        <Price value={grandTotal} serif className="text-2xl text-ink" />
      </div>

      <div className="mt-6">
        <PromoCode />
      </div>
    </div>
  );
}
