import WishlistGrid from '@/components/wishlist/WishlistGrid';

export const metadata = { title: 'Wishlist — LUMIÈRE' };

export default function WishlistPage() {
  return (
    <section>
      <h2 className="font-serif text-2xl">Wishlist</h2>
      <p className="mt-2 text-sm text-ink-soft">Pieces you&apos;ve saved for later.</p>
      <div className="mt-8">
        <WishlistGrid />
      </div>
    </section>
  );
}
