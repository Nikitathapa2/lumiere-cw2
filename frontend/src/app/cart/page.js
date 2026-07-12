import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';
import CartView from '@/components/cart/CartView';
import { api, safe, toCardProduct } from '@/lib/api';

export const revalidate = 3600;

export const metadata = {
  title: 'Your Bag — LUMIÈRE',
};

export default async function CartPage() {
  const complement = await safe(
    api.getProducts({ tag: 'complement', limit: 4 }),
    { items: [] }
  );

  return (
    <>
      <Header variant="default" />

      <main className="section pt-24 pb-12 md:pb-16">
        <div className="container-lux">
          <h1 className="font-serif text-4xl md:text-5xl">Your Bag</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Carefully curated selections for your collection.
          </p>

          <div className="mt-10">
            <CartView />
          </div>
        </div>
      </main>

      {complement.items.length ? (
        <section className="section pb-20">
          <div className="container-lux">
            <SectionHeading title="Complement the Collection" />
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
              {complement.items.map((p) => (
                <ProductCard key={p.slug} product={toCardProduct(p)} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
    </>
  );
}
