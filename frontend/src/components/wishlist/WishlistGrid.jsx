'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import WishlistButton from '@/components/product/WishlistButton';

export default function WishlistGrid() {
  const { slugs, hydrated } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState(null);

  const key = slugs.join(',');
  useEffect(() => {
    if (!hydrated) return;
    if (!slugs.length) {
      setProducts([]);
      return;
    }
    (async () => {
      const res = await api
        .getProducts({ slugs: key, limit: slugs.length })
        .catch(() => ({ items: [] }));
      const bySlug = new Map(res.items.map((p) => [p.slug, p]));
      setProducts(slugs.map((s) => bySlug.get(s)).filter(Boolean));
    })();
  }, [key, hydrated]);

  if (!hydrated || products === null) return <div className="min-h-[40vh]" aria-hidden />;

  if (!products.length) {
    return (
      <div className="flex flex-col items-start gap-6 py-10">
        <p className="text-ink-soft">Your wishlist is empty.</p>
        <Button href="/collections" variant="primary">Explore the Collection</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <WishlistTile key={p.slug} product={p} onAdd={addItem} />
      ))}
    </div>
  );
}

function WishlistTile({ product, onAdd }) {
  const hasSizes = (product.sizes || []).length > 0;
  const card = {
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images?.[0] || null,
  };

  return (
    <div className="group relative">
      <WishlistButton slug={product.slug} className="absolute right-3 top-3 z-10" />
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
          {card.image ? (
            <Image
              src={card.image}
              alt={card.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-lux group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
        <h3 className="mt-3 text-sm font-medium text-ink">{card.name}</h3>
        <Price value={card.price} className="mt-1 block text-sm text-ink-soft" />
      </Link>

      {hasSizes ? (
        <Button href={`/product/${product.slug}`} variant="secondary" size="sm" className="mt-3 w-full">
          Select Options
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          onClick={() =>
            onAdd({
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: card.image,
              size: null,
              color: product.colors?.[0]?.name || null,
              subLabel: product.subLabel || '',
            })
          }
        >
          Move to Bag
        </Button>
      )}
    </div>
  );
}
