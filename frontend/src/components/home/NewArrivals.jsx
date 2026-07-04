import ProductCard from '@/components/ui/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';
import TextLink from '@/components/ui/TextLink';
import { toCardProduct } from '@/lib/api';

export default function NewArrivals({ products = [] }) {
  if (!products.length) return null;
  return (
    <section className="section py-16 md:py-24">
      <div className="container-lux">
        <SectionHeading
          title="New Arrivals"
          action={<TextLink href="/new-arrivals">View All</TextLink>}
        />
        <p className="-mt-4 mb-10 max-w-md text-sm text-ink-soft">
          Discreet silhouettes and unparalleled craftsmanship, defined for the modern wardrobe.
        </p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={toCardProduct(p)} />
          ))}
        </div>
      </div>
    </section>
  );
}
