import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/shop/ProductGrid';
import Link from 'next/link';
import Image from 'next/image';
import { api, safe } from '@/lib/api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await safe(api.getCollection(slug), null);
  if (!data) return { title: 'Collection — LUMIÈRE' };
  return {
    title: `${data.collection.title} — LUMIÈRE`,
    description: data.collection.description,
  };
}

export default async function CollectionDetailPage({ params }) {
  const { slug } = await params;
  const data = await safe(api.getCollection(slug), null);

  if (!data || !data.collection) notFound();

  const { collection, products } = data;

  return (
    <>
      <Header variant="default" />
      <main className="bg-bg">

        <section className="relative min-h-[50vh] flex items-end overflow-hidden bg-dark">
          {collection.heroImage && (
            <Image
              src={collection.heroImage}
              alt={collection.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />

          <div className="relative z-10 container-lux pb-16 pt-40">
            <nav className="mb-5 flex items-center gap-1.5 text-xs">
              <Link href="/" className="text-on-dark/40 hover:text-on-dark/70 transition-colors uppercase tracking-wide">
                Home
              </Link>
              <span className="text-on-dark/30">/</span>
              <Link href="/collections" className="text-on-dark/40 hover:text-on-dark/70 transition-colors uppercase tracking-wide">
                Collections
              </Link>
              <span className="text-on-dark/30">/</span>
              <span className="text-on-dark/70 uppercase tracking-wide">{collection.title}</span>
            </nav>

            <div className="max-w-2xl">
              {collection.kicker && (
                <p className="u-label text-accent mb-3">{collection.kicker}</p>
              )}
              <h1 className="font-serif text-5xl md:text-6xl text-on-dark leading-tight mb-4">
                {collection.title}
              </h1>
              {collection.description && (
                <p className="text-on-dark/60 text-sm leading-relaxed max-w-lg">
                  {collection.description}
                </p>
              )}
              <p className="mt-4 u-label text-on-dark/40">
                {products.length} {products.length === 1 ? 'Piece' : 'Pieces'}
              </p>
            </div>
          </div>
        </section>

        <section className="container-lux py-16">
          {products.length === 0 ? (
            <EmptyCollection collection={collection} />
          ) : (
            <>
              <div className="mb-10 flex items-end justify-between gap-4">
                <h2 className="font-serif text-2xl text-ink">The Pieces</h2>
                <Link
                  href="/collections"
                  className="text-xs uppercase tracking-widest text-muted hover:text-ink transition-colors border-b border-muted hover:border-ink pb-0.5"
                >
                  All Collections
                </Link>
              </div>
              <ProductGrid products={products} />
            </>
          )}
        </section>

        <section className="border-t border-line bg-surface py-12">
          <div className="container-lux flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="u-label text-muted mb-1">LOOKING FOR MORE?</p>
              <h3 className="font-serif text-2xl text-ink">
                Explore All Collections
              </h3>
            </div>
            <Link
              href="/collections"
              className="shrink-0 inline-block bg-ink text-white text-xs font-semibold tracking-widest uppercase px-10 py-4 hover:bg-ink/90 transition-colors"
            >
              View Collections
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function EmptyCollection({ collection }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="material-symbols-outlined text-line mb-4" style={{ fontSize: '48px' }}>
        inventory_2
      </span>
      <h3 className="font-serif text-2xl text-ink mb-2">Coming Soon</h3>
      <p className="text-sm text-muted max-w-xs leading-relaxed mb-8">
        The {collection.title} collection is being curated. Check back soon for the full edit.
      </p>
      <Link
        href="/collections"
        className="inline-block bg-ink text-white text-xs font-semibold tracking-widest uppercase px-8 py-3 hover:bg-ink/90 transition-colors"
      >
        Browse All Collections
      </Link>
    </div>
  );
}
