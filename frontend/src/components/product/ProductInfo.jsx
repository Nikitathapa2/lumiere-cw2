'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Button from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import Pill from '@/components/ui/Pill';
import Accordion from '@/components/ui/Accordion';
import TextLink from '@/components/ui/TextLink';
import { HeartGlyph } from './HeartGlyph';

export default function ProductInfo({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { has, toggle } = useWishlist();
  const [size, setSize] = useState('');
  const [error, setError] = useState(false);

  const hasSizes = (product.sizes || []).length > 0;
  const wished = has(product.slug);

  const handleAdd = () => {
    if (!loading && !isAuthenticated) {
      const url = new URL(window.location.href);
      router.push(`/login?redirect=${encodeURIComponent(url.pathname)}`);
      return;
    }
    if (hasSizes && !size) {
      setError(true);
      return;
    }
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || null,
      size: size || null,
      color: product.colors?.[0]?.name || null,
      subLabel: product.subLabel || '',
    });
  };

  return (
    <div className="lg:sticky lg:top-28">
      <h1 className="font-serif text-3xl md:text-4xl">{product.name}</h1>
      <Price value={product.price} className="mt-3 block text-lg text-ink-soft" />

      <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-soft">{product.description}</p>

      {hasSizes && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="u-label text-ink">Select Size</span>
            <TextLink href="/size-guide" className="border-0 pb-0 text-muted hover:opacity-60">
              Size Guide
            </TextLink>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <Pill
                key={s}
                selected={size === s}
                onClick={() => {
                  setSize(s);
                  setError(false);
                }}
              >
                {s}
              </Pill>
            ))}
          </div>
          {error && <p className="mt-2 text-xs text-accent">Please select a size.</p>}
        </div>
      )}

      <div className="mt-8 space-y-3">
        <Button variant="primary" size="full" onClick={handleAdd}>
          Add to Bag
        </Button>
        <Button variant="secondary" size="full" onClick={() => toggle(product.slug)}>
          <HeartGlyph filled={wished} /> {wished ? 'In Your Wishlist' : 'Add to Wishlist'}
        </Button>
      </div>

      <div className="mt-10">
        <Accordion title="Material & Care" defaultOpen>
          <ul className="space-y-1.5">
            {(product.material || []).map((m) => (
              <li key={m}>• {m}</li>
            ))}
          </ul>
        </Accordion>
        <Accordion title="Shipping & Returns">
          <p>
            Complimentary carbon-neutral shipping on all domestic orders. Returns accepted within
            30 days in original condition. Two-year artisan guarantee on handcrafted leather goods.
          </p>
        </Accordion>
      </div>
    </div>
  );
}
