import ProductCard from '@/components/ui/ProductCard';
import { toCardProduct } from '@/lib/api';

export default function ProductGrid({ products = [] }) {
  if (!products.length) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="u-label text-muted">No products match your selection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.slug} product={toCardProduct(p)} priceAlign="right" />
      ))}
    </div>
  );
}
