'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import { LockIcon } from '@/components/icons';
import ShippingForm from './ShippingForm';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Nepal',
};
const REQUIRED = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country'];

export default function CheckoutView() {
  const router = useRouter();
  const { items, orderItems, promo, hydrated, clear } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanceled(new URLSearchParams(window.location.search).get('canceled') === '1');
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const prefill = { firstName: user.firstName || '', lastName: user.lastName || '' };
      const { addresses } = await api.getAddresses().catch(() => ({ addresses: [] }));
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def) {
        Object.assign(prefill, {
          firstName: def.firstName,
          lastName: def.lastName,
          address: def.address,
          city: def.city,
          postalCode: def.postalCode,
          country: def.country,
        });
      }
      setForm((f) => {
        const merged = { ...f };
        for (const [k, v] of Object.entries(prefill)) if (!merged[k] && v) merged[k] = v;
        return merged;
      });
    })();
  }, [user]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: false }));
  };

  const handleComplete = async () => {
    const nextErrors = {};
    REQUIRED.forEach((f) => {
      if (!form[f]?.trim()) nextErrors[f] = true;
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setServerError('Please complete all shipping fields.');
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const { url, orderId, accessToken } = await api.createCheckoutSession({
        items: orderItems,
        shipping: form,
        promoCode: promo?.code || null,
      });

      if (url) {
        window.location.href = url;
        return;
      }

      clear();
      // Carry the capability token so a guest can view the just-placed order.
      const tokenParam = accessToken ? `&t=${encodeURIComponent(accessToken)}` : '';
      router.push(`/checkout/confirmation?order=${orderId}${tokenParam}`);
    } catch (err) {
      setServerError(err.message || 'Something went wrong placing your order.');
      setSubmitting(false);
    }
  };

  if (!hydrated) return <div className="min-h-[50vh]" aria-hidden />;

  if (!items.length) {
    return (
      <div className="flex flex-col items-start gap-6 py-16">
        <p className="text-ink-soft">Your bag is empty — there is nothing to check out.</p>
        <Button href="/collections" variant="primary">Explore the Collection</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
      <div className="space-y-12">
        {canceled ? (
          <div className="border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
            Your payment was canceled — your bag has been kept. You can review your
            details and try again whenever you’re ready.
          </div>
        ) : null}

        <ShippingForm values={form} onChange={setField} errors={errors} />
        <PaymentMethod />

        <div>
          {serverError ? <p className="mb-3 text-sm text-accent">{serverError}</p> : null}
          <Button variant="primary" size="full" onClick={handleComplete} disabled={submitting}>
            <LockIcon size={16} /> {submitting ? 'Redirecting to Secure Checkout…' : 'Pay with Stripe'}
          </Button>
          <p className="mt-3 text-center text-xs uppercase tracking-wide text-muted">
            You’ll be redirected to Stripe’s secure checkout to complete payment.
          </p>
        </div>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <OrderSummary />
      </div>
    </div>
  );
}
