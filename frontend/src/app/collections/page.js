import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { api, safe } from '@/lib/api';

export const metadata = {
  title: 'Collections — LUMIÈRE',
  description: 'Explore LUMIÈRE curated collections — each a deliberate dialogue between material, craft, and season.',
};

export default async function CollectionsPage() {
  const data = await safe(api.getCollections(), { items: [] });
  const allCollections = data?.items || [];
  const featured = allCollections.filter((c) => c.featured).slice(0, 3);
  const more = allCollections.filter((c) => !c.featured);

  return (
    <>
      <Header variant="default" />
      <main className="bg-bg">

        <section className="relative bg-dark overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative z-10 container-lux pt-40 pb-20 text-center">
            <p className="u-label text-accent mb-4 tracking-widest">LUMIÈRE COLLECTIONS</p>
            <h1 className="font-serif text-5xl md:text-7xl text-on-dark leading-[1.05] mb-6">
              Curated Narratives
            </h1>
            <p className="text-on-dark/50 text-sm max-w-md mx-auto leading-relaxed">
              Each collection is a deliberate dialogue between material, craft, and the season —
              pieces that belong together, discovered as one.
            </p>
            {allCollections.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
                {allCollections.map((col) => (
                  <Link
                    key={col.slug}
                    href={`/collections/${col.slug}`}
                    className="text-xs uppercase tracking-widest text-on-dark/50 hover:text-accent transition-colors border-b border-on-dark/20 hover:border-accent pb-0.5"
                  >
                    {col.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {featured.length > 0 && (
          <section className="container-lux pt-16 pb-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="u-label text-muted mb-1">FEATURED COLLECTIONS</p>
                <h2 className="font-serif text-3xl text-ink">The Current Chapters</h2>
              </div>
              {more.length > 0 && (
                <a
                  href="#more-collections"
                  className="text-xs uppercase tracking-widest text-muted underline underline-offset-4 hover:text-ink transition-colors hidden md:block"
                >
                  View All
                </a>
              )}
            </div>

            <div
              className={`grid gap-5 ${
                featured.length === 1
                  ? 'grid-cols-1 max-w-lg mx-auto'
                  : featured.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-3'
              }`}
            >
              {featured.map((col) => (
                <CollectionCard key={col.slug} col={col} />
              ))}
            </div>
          </section>
        )}

        {more.length > 0 && (
          <section id="more-collections" className="container-lux pt-10 pb-4">
            <p className="u-label text-muted mb-6">MORE COLLECTIONS</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {more.map((col) => (
                <Link
                  key={col.slug}
                  href={`/collections/${col.slug}`}
                  className="group relative block overflow-hidden border border-line hover:border-ink transition-colors"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-line">
                    {col.heroImage && (
                      <Image
                        src={col.heroImage}
                        alt={col.title}
                        fill
                        sizes="25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    )}
                    <div className="absolute inset-0 bg-dark/40" />
                  </div>
                  <div className="p-4 bg-surface">
                    {col.kicker && (
                      <p className="u-label text-accent mb-1">{col.kicker}</p>
                    )}
                    <h3 className="text-sm font-semibold text-ink leading-snug">{col.title}</h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted group-hover:text-ink transition-colors">
                      Explore
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="container-lux py-14">
          <div className="border border-line p-10 md:p-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="u-label text-muted mb-2">NOT LOOKING FOR A SPECIFIC COLLECTION?</p>
              <h2 className="font-serif text-3xl text-ink">Browse the Full Edit</h2>
              <p className="mt-2 text-sm text-ink-soft max-w-sm leading-relaxed">
                Filter by category, size, colour, and price across every piece in the LUMIÈRE catalog.
              </p>
            </div>
            <Link
              href="/shop"
              className="shrink-0 inline-block bg-ink text-white text-xs font-semibold tracking-widest uppercase px-10 py-4 hover:bg-ink/90 transition-colors"
            >
              Shop All Products
            </Link>
          </div>
        </section>

        <section className="bg-dark py-24 text-center">
          <p className="u-label text-accent mb-4 tracking-widest">THE ATELIER</p>
          <h2 className="font-serif text-4xl md:text-5xl text-on-dark mb-5">
            Crafted with Intention.
          </h2>
          <p className="text-on-dark/50 text-sm max-w-sm mx-auto leading-relaxed mb-10">
            Every LUMIÈRE piece is the product of considered process — materials sourced
            deliberately, constructed to last a generation.
          </p>
          <Link
            href="/sustainability"
            className="inline-block border border-on-dark/30 text-on-dark text-xs font-semibold tracking-widest uppercase px-10 py-4 hover:bg-on-dark/10 transition-colors"
          >
            Our Sustainability Commitment
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ── CollectionCard ─────────────────────────────────────── */

function CollectionCard({ col }) {
  return (
    <Link href={`/collections/${col.slug}`} className="group relative block overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden bg-line">
        {col.heroImage ? (
          <Image
            src={col.heroImage}
            alt={col.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full bg-dark/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {col.kicker && <p className="u-label text-accent mb-2">{col.kicker}</p>}
          <h3 className="font-serif text-2xl text-white leading-snug">{col.title}</h3>
          {col.description && (
            <p className="mt-2 text-xs text-white/60 leading-relaxed line-clamp-2 max-w-xs">
              {col.description}
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
            Explore Collection
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
