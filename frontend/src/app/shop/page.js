import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FilterSidebar from '@/components/shop/FilterSidebar';
import ProductGrid from '@/components/shop/ProductGrid';
import Pagination from '@/components/shop/Pagination';
import SortSelect from '@/components/shop/SortSelect';
import SearchBar from '@/components/shop/SearchBar';
import Link from 'next/link';
import { api, safe } from '@/lib/api';

const PAGE_SIZE = 12;

export const metadata = {
  title: 'Shop — LUMIÈRE',
  description: 'Browse the complete LUMIÈRE catalog — filter by category, size, colour, and price.',
};

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const sort = sp.sort || 'newest';
  const q = sp.q || '';

  const data = await safe(
    api.getProducts({
      category: sp.category,
      size: sp.size,
      color: sp.color,
      maxPrice: sp.maxPrice,
      q: q || undefined,
      sort,
      page,
      limit: PAGE_SIZE,
    }),
    { items: [], total: 0, totalPages: 1, facets: {}, page: 1 }
  );

  const { items, total, totalPages, facets } = data;

  const categoryLabel = sp.category
    ? sp.category.charAt(0).toUpperCase() + sp.category.slice(1)
    : null;

  return (
    <>
      <Header variant="default" />
      <main className="bg-bg">

        <section className="bg-dark">
          <div className="container-lux pt-36 pb-14">
            <nav className="mb-6 flex items-center gap-1.5 text-xs">
              <Link href="/" className="text-on-dark/40 hover:text-on-dark/70 transition-colors uppercase tracking-wide">
                Home
              </Link>
              <span className="text-on-dark/30">/</span>
              {categoryLabel ? (
                <>
                  <Link href="/shop" className="text-on-dark/40 hover:text-on-dark/70 transition-colors uppercase tracking-wide">
                    Shop
                  </Link>
                  <span className="text-on-dark/30">/</span>
                  <span className="text-on-dark/60 uppercase tracking-wide">{categoryLabel}</span>
                </>
              ) : (
                <span className="text-on-dark/60 uppercase tracking-wide">Shop</span>
              )}
            </nav>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="u-label text-accent mb-3 tracking-widest">THE FULL EDIT</p>
                <h1 className="font-serif text-5xl md:text-6xl text-on-dark leading-tight">
                  {categoryLabel ?? 'All Products'}
                </h1>
              </div>
              <p className="text-on-dark/40 text-sm">
                {q ? (
                  <>
                    <span className="text-on-dark/70">{total}</span> results for{' '}
                    <span className="italic text-on-dark/70">&ldquo;{q}&rdquo;</span>
                  </>
                ) : (
                  <>
                    <span className="text-on-dark/70">{total}</span>{' '}
                    {total === 1 ? 'piece' : 'pieces'}
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        <div className="container-lux py-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-12 lg:items-start">

            <Suspense fallback={<div className="w-full lg:w-60 lg:shrink-0" />}>
              <FilterSidebar facets={facets} />
            </Suspense>

            <div className="min-w-0 flex-1">
              <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <Suspense fallback={null}>
                    <SearchBar initialValue={q} />
                  </Suspense>
                </div>
                <Suspense fallback={null}>
                  <SortSelect value={sort} />
                </Suspense>
              </div>

              <p className="mb-6 text-sm text-muted">
                Showing{' '}
                <span className="font-medium text-ink">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                </span>{' '}
                of <span className="font-medium text-ink">{total}</span>
              </p>

              <ProductGrid products={items} />
              <Pagination page={page} totalPages={totalPages} searchParams={sp} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
