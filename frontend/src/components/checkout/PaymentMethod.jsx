'use client';

import { CardIcon, LockIcon } from '@/components/icons';

export default function PaymentMethod() {
  return (
    <section>
      <h2 className="border-b border-line pb-3 font-serif text-2xl">Payment</h2>

      <div className="mt-6 border border-line bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="u-label text-ink">Secure Checkout</span>
          <CardIcon size={22} className="text-muted" />
        </div>

        <div className="flex items-start gap-3">
          <LockIcon size={18} className="mt-0.5 shrink-0 text-ink" />
          <p className="text-sm leading-relaxed text-ink-soft">
            Payment is processed by <strong className="text-ink">Stripe</strong>. When you
            press <span className="u-label">Pay with Stripe</span>, you’ll be taken to a secure
            page to enter your card details. We never see or store your card information.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-[11px] uppercase tracking-wide text-muted">
          <span>Visa</span>
          <span aria-hidden>·</span>
          <span>Mastercard</span>
          <span aria-hidden>·</span>
          <span>Amex</span>
          <span aria-hidden>·</span>
          <span>and more</span>
        </div>
      </div>
    </section>
  );
}
