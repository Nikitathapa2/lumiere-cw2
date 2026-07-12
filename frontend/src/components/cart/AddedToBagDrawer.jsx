'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import { CloseIcon, CheckIcon } from '@/components/icons';

export default function AddedToBagDrawer() {
  const { drawerOpen, closeDrawer, lastAdded, count } = useCart();

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const t = setTimeout(closeDrawer, 4500);
    return () => clearTimeout(t);
  }, [drawerOpen, lastAdded, closeDrawer]);

  if (!lastAdded) return null;

  return (
    <div
      className={`fixed right-4 top-20 z-50 w-[20rem] max-w-[calc(100vw-2rem)] transition-all duration-300 ease-lux ${
        drawerOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="border border-line bg-surface p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="u-label inline-flex items-center gap-1.5 text-ink">
            <CheckIcon size={14} /> Added to Bag
          </span>
          <button aria-label="Close" onClick={closeDrawer} className="text-muted hover:text-ink">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-bg">
            {lastAdded.image ? (
              <Image src={lastAdded.image} alt={lastAdded.name} fill sizes="64px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium uppercase leading-snug text-ink">{lastAdded.name}</h4>
            {lastAdded.size ? <p className="u-label mt-1 text-muted">Size {lastAdded.size}</p> : null}
            <Price value={lastAdded.price} className="mt-1 block text-sm text-ink-soft" />
          </div>
        </div>

        <Button href="/cart" variant="primary" size="full" className="mt-5" onClick={closeDrawer}>
          Checkout
        </Button>
        <p className="mt-3 text-center text-xs text-muted">{count} item{count === 1 ? '' : 's'} in your bag</p>
      </div>
    </div>
  );
}
