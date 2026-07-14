import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import Divider from '@/components/ui/Divider';
import { CheckIcon } from '@/components/icons';
import ClearCartOnSuccess from '@/components/checkout/ClearCartOnSuccess';
import { api, safe } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Order Confirmed — LUMIÈRE',
};

export default async function ConfirmationPage({ searchParams }) {
  const sp = await searchParams;

  let order = null;
  if (sp?.session_id) {
    const data = await safe(api.verifyCheckout(sp.session_id), null);
    order = data?.order || null;
  } else if (sp?.order) {
    const data = await safe(api.getOrder(sp.order, sp?.t), null);
    order = data?.order || null;
  }

  const paid = order?.paymentStatus === 'paid';

  return (
    <>
      <Header variant="checkout" step="confirmation" />

      <main className="section pt-24 pb-16 md:pb-24">
        <div className="container-lux max-w-2xl">
          {paid ? <ClearCartOnSuccess /> : null}

          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink text-ink">
              <CheckIcon size={22} />
            </span>
            <h1 className="mt-6 font-serif text-4xl">
              {paid ? 'Thank You' : order ? 'Payment Processing' : 'Thank You'}
            </h1>
            <p className="mt-3 max-w-md text-sm text-ink-soft">
              {paid || !order
                ? 'Your order has been received. A confirmation has been sent to your inbox. Each piece is prepared by hand with care before it ships.'
                : 'Your payment is being confirmed. This page will reflect your order once the payment clears — you can also check your account orders shortly.'}
            </p>
          </div>

          {order ? (
            <div className="mt-10 border border-line bg-surface p-6 md:p-8">
              <div className="flex items-center justify-between">
                <span className="u-label text-muted">Order Number</span>
                <span className="font-medium tracking-wide text-ink">{order.orderNumber}</span>
              </div>

              <Divider className="my-5" />

              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li key={`${item.slug}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-ink">
                      {item.name}
                      <span className="text-muted">
                        {' '}
                        ×{item.qty}
                        {item.size ? ` · ${item.size}` : ''}
                      </span>
                    </span>
                    <Price value={item.price * item.qty} className="text-ink-soft" />
                  </li>
                ))}
              </ul>

              <Divider className="my-5" />

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd><Price value={order.subtotal} /></dd>
                </div>
                {order.discount > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Discount{order.promoCode ? ` (${order.promoCode})` : ''}</dt>
                    <dd className="text-accent">−<Price value={order.discount} /></dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Shipping</dt>
                  <dd className="text-accent">Complimentary</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Tax</dt>
                  <dd><Price value={order.tax} /></dd>
                </div>
                <div className="flex justify-between pt-2">
                  <dt className="u-label text-ink">Total</dt>
                  <dd><Price value={order.total} serif className="text-lg" /></dd>
                </div>
              </dl>

              <p className="mt-6 text-xs text-muted">
                Shipping to {order.shippingAddress.firstName} {order.shippingAddress.lastName},{' '}
                {order.shippingAddress.city}, {order.shippingAddress.country}.
              </p>
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-muted">
              Order details are unavailable.{' '}
              <Link href="/" className="u-link border-ink">Return Home</Link>
            </p>
          )}

          <div className="mt-10 flex justify-center">
            <Button href="/collections" variant="primary" size="lg">
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>

      <Footer compact locale="ENGLISH / USD" />
    </>
  );
}
