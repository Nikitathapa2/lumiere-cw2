'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';

export default function PromoCode() {
  const { promo, applyPromo, removePromo } = useCart();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim() || pending) return;
    setPending(true);
    const result = await applyPromo(code.trim());
    setStatus(result);
    setPending(false);
    if (result.ok) setCode('');
  };

  return (
    <div className="border border-line bg-surface p-5">
      <p className="u-label mb-3 text-ink-soft">Promotional Code</p>

      {promo ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink">
            <span className="font-medium">{promo.code}</span> applied
          </span>
          <button
            type="button"
            onClick={() => {
              removePromo();
              setStatus(null);
            }}
            className="u-label text-muted hover:text-ink"
          >
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex items-stretch gap-2">
          <Input
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            containerClassName="flex-1"
            aria-label="Promotional code"
          />
          <Button type="submit" variant="secondary" size="sm" disabled={pending}>
            {pending ? '…' : 'Apply'}
          </Button>
        </form>
      )}

      {status && !status.ok ? <p className="mt-2 text-xs text-accent">{status.message}</p> : null}
    </div>
  );
}
