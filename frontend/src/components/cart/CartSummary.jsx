'use client';

import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import Divider from '@/components/ui/Divider';
import { ShieldIcon, TruckIcon } from '@/components/icons';

export default function CartSummary() {
  const { subtotal, discount, total, promo } = useCart();

  return (
    <div className="border border-line bg-surface p-6 md:p-7">
      <h2 className="font-serif text-xl">Summary</h2>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
          <dd>
            <Price value={subtotal} className="text-ink" />
          </dd>
        </div>

        {promo && discount > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-ink-soft">Discount ({promo.code})</dt>
            <dd className="text-accent">
              −<Price value={discount} />
            </dd>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <dt className="text-ink-soft">Shipping Estimate</dt>
          <dd className="font-medium text-accent">Complimentary</dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-ink-soft">Tax</dt>
          <dd className="text-muted">Calculated at checkout</dd>
        </div>
      </dl>

      <Divider className="my-5" />

      <div className="flex items-baseline justify-between">
        <span className="u-label text-ink">Total</span>
        <Price value={total} serif className="text-2xl text-ink" />
      </div>

      <Button href="/checkout" variant="primary" size="full" className="mt-6">
        Proceed to Checkout
      </Button>

      <ul className="mt-6 space-y-3 text-xs text-ink-soft">
        <li className="flex items-start gap-2.5">
          <ShieldIcon size={16} className="mt-px shrink-0 text-muted" />
          Two-year artisan guarantee on all handcrafted leather goods.
        </li>
        <li className="flex items-start gap-2.5">
          <TruckIcon size={16} className="mt-px shrink-0 text-muted" />
          Secure carbon-neutral shipping on all domestic orders.
        </li>
      </ul>
    </div>
  );
}
