import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/shop/ProductGrid';
import SaleCountdown from '@/components/sale/SaleCountdown';
import Link from 'next/link';
import { api, safe } from '@/lib/api';

export const metadata = {
  title: 'Sale — LUMIÈRE',
  description: 'Limited-time reductions on selected LUMIÈRE pieces. Curated quality at exceptional value.',
};

const PROMOS = [
  { icon: 'local_shipping', label: 'Free Delivery', sub: 'On all sale orders over $150' },
  { icon: 'replay', label: 'Free Returns', sub: '30 days, no questions asked' },
  { icon: 'sell', label: 'Extra 10% Off', sub: 'Use code LUMIERE10 at checkout' },
  { icon: 'verified_user', label: 'Authenticity Guaranteed', sub: 'Every piece is genuine' },
];

const SALE_END_ISO = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
})();

export default async function SalePage({ searchParams }) {
  const sp = await searchParams;
  const sort = sp.sort || 'newest';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  const saleData = await safe(
    api.getProducts({ onSale: 'true', sort, page, limit: 24 }),
    { items: [], total: 0, totalPages: 1 }
  );

  let products = saleData?.items || [];
  let total = saleData?.total || 0;
  let hasSaleProducts = products.length > 0;

  if (!hasSaleProducts) {
    const allData = await safe(
      api.getProducts({ sort: 'newest', limit: 12 }),
      { items: [] }
    );
    products = allData?.items || [];
    total = products.length;
  }

  return (
    <>
      <Header variant="default" />
      <main className="bg-bg">

        <section className="bg-dark relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-45deg, #F2C84B 0, #F2C84B 1px, transparent 0, transparent 60px)',
            }}
          />

          <div className="relative z-10 container-lux pt-36 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">

              <div>
                <p className="u-label text-accent-bg mb-4 tracking-widest">
                  LIMITED TIME · SELECTED PIECES
                </p>
                <h1 className="font-serif leading-none text-on-dark">
                  <span className="block text-[5rem] md:text-[9rem] lg:text-[11rem] leading-none tracking-tight">
                    SALE
                  </span>
                  <span className="block text-3xl md:text-5xl mt-2 text-on-dark/80">
                    Up to 50% Off
                  </span>
                </h1>
                <p className="mt-6 text-on-dark/50 text-sm max-w-md leading-relaxed">
                  A careful selection of LUMIÈRE pieces, reduced for a limited time.
                  The same considered quality — at exceptional value.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a
                    href="#sale-products"
                    className="inline-block bg-accent-bg text-ink text-xs font-semibold tracking-widest uppercase px-10 py-4 hover:bg-accent-bg/90 transition-colors"
                  >
                    Shop the Sale
                  </a>
                  <Link
                    href="/collections"
                    className="inline-block border border-on-dark/30 text-on-dark text-xs font-semibold tracking-widest uppercase px-10 py-4 hover:bg-on-dark/10 transition-colors"
                  >
                    Full Collection
                  </Link>
                </div>
              </div>

              <div className="lg:pb-2">
                <p className="u-label text-on-dark/40 mb-4">SALE ENDS IN</p>
                <SaleCountdown endDate={SALE_END_ISO} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface border-b border-line">
          <div className="container-lux py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-line">
              {PROMOS.map((p) => (
                <div key={p.label} className="flex items-center gap-3 px-4 md:px-6 py-3">
                  <span className="material-symbols-outlined text-accent shrink-0" style={{ fontSize: '20px' }}>
                    {p.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink">{p.label}</p>
                    <p className="text-[11px] text-muted leading-snug">{p.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-accent-bg">
          <div className="container-lux py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">
              Extra 10% off sale items — use code{' '}
              <span className="font-bold tracking-wider">LUMIERE10</span> at checkout
            </p>
            <a
              href="#sale-products"
              className="shrink-0 text-xs uppercase tracking-widest font-semibold text-ink underline underline-offset-4 hover:no-underline transition-all"
            >
              Apply Now
            </a>
          </div>
        </section>

        <section id="sale-products" className="container-lux py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="u-label text-muted mb-1">
                {hasSaleProducts ? 'SALE PICKS' : 'FEATURED PRODUCTS'}
              </p>
              <h2 className="font-serif text-3xl text-ink">
                {hasSaleProducts
                  ? `${total} Sale ${total === 1 ? 'Item' : 'Items'}`
                  : 'Discover the Edit'}
              </h2>
              {!hasSaleProducts && (
                <p className="mt-1 text-sm text-muted">
                  Sale launches soon — browse the full collection in the meantime.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <SortBar current={sort} />
            </div>
          </div>

          <ProductGrid products={products} />

          {hasSaleProducts && total > 24 && (
            <div className="mt-12 text-center">
              <Link
                href={`/sale?sort=${sort}&page=${page + 1}`}
                className="inline-block border border-line bg-surface text-ink text-xs font-semibold tracking-widest uppercase px-10 py-4 hover:bg-ink hover:text-white hover:border-ink transition-all"
              >
                Load More
              </Link>
            </div>
          )}
        </section>

        <section className="bg-dark py-20 text-center">
          <p className="u-label text-accent-bg mb-4 tracking-widest">DON&apos;T MISS OUT</p>
          <h2 className="font-serif text-4xl text-on-dark mb-5">
            Sale Ends Soon
          </h2>
          <p className="text-on-dark/50 text-sm max-w-sm mx-auto leading-relaxed mb-10">
            These reductions are strictly time-limited. Once a size sells out, it&apos;s gone —
            no restocks on sale items.
          </p>
          <a
            href="#sale-products"
            className="inline-block bg-accent-bg text-ink text-xs font-semibold tracking-widest uppercase px-10 py-4 hover:bg-accent-bg/90 transition-colors"
          >
            Shop Now
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'New In' },
  { value: 'price-asc', label: 'Price: Low–High' },
  { value: 'price-desc', label: 'Price: High–Low' },
];

function SortBar({ current }) {
  return (
    <div className="flex items-center gap-1 border border-line overflow-hidden">
      {SORT_OPTIONS.map((opt) => (
        <Link
          key={opt.value}
          href={`/sale?sort=${opt.value}`}
          className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
            current === opt.value
              ? 'bg-ink text-white'
              : 'text-ink-soft hover:bg-line'
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}
