'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Price from '@/components/ui/Price';
import ProductImage from '@/components/ui/ProductImage';
import QtyStepper from '@/components/ui/QtyStepper';

export default function CartLineItem({ item }) {
  const { updateQty, removeItem, lineKey } = useCart();
  const key = lineKey(item);

  const variant = [item.size ? `Size ${item.size}` : null, item.subLabel || item.color]
    .filter(Boolean)
    .join(' / ');

  return (
    <div className="flex gap-5 py-6">
      <Link href={`/product/${item.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden bg-bg">
        <ProductImage src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/product/${item.slug}`}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">{item.name}</h3>
            </Link>
            {variant ? <p className="u-label mt-1 text-muted">{variant}</p> : null}
          </div>
          <Price value={item.price * item.qty} className="text-sm text-ink" />
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <QtyStepper value={item.qty} onChange={(q) => updateQty(key, q)} />
          <button
            type="button"
            onClick={() => removeItem(key)}
            className="u-label text-muted underline-offset-4 transition-opacity hover:text-ink hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
