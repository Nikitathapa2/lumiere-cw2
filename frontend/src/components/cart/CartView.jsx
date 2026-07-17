'use client';

import { useCart } from '@/context/CartContext';
import CartLineItem from './CartLineItem';
import CartSummary from './CartSummary';
import PromoCode from './PromoCode';
import EmptyBag from './EmptyBag';

export default function CartView() {
  const { items, hydrated, lineKey } = useCart();

  if (!hydrated) return <div className="min-h-[40vh]" aria-hidden />;

  if (!items.length) return <EmptyBag />;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
      <div className="divide-y divide-line border-t border-line">
        {items.map((item) => (
          <CartLineItem key={lineKey(item)} item={item} />
        ))}
      </div>

      <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        <CartSummary />
        <PromoCode />
      </div>
    </div>
  );
}
