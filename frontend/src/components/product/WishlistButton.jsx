'use client';

import { useWishlist } from '@/context/WishlistContext';
import { HeartGlyph } from './HeartGlyph';
import { cn } from '@/lib/cn';

export default function WishlistButton({ slug, className }) {
  const { has, toggle } = useWishlist();
  const active = has(slug);

  return (
    <button
      type="button"
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-surface',
        active && 'text-accent',
        className
      )}
    >
      <HeartGlyph size={15} filled={active} />
    </button>
  );
}
