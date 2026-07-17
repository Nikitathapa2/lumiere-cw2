import ProductCard from '@/components/ui/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';
import { toCardProduct } from '@/lib/api';

export default function StyleWith({ products = [] }) {
  if (!products.length) return null;
  return (
    <section className="section border-t border-line py-16 md:py-24">
      <div className="container-lux">
        <SectionHeading title="Style With" centered />
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={toCardProduct(p)} />
          ))}
        </div>
      </div>
    </section>
  );
}
