import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FilterSidebar from '@/components/shop/FilterSidebar';
import ProductGrid from '@/components/shop/ProductGrid';
import Pagination from '@/components/shop/Pagination';
import SortSelect from '@/components/shop/SortSelect';
import SearchBar from '@/components/shop/SearchBar';
import Link from 'next/link';
import Image from 'next/image';
import { api, safe } from '@/lib/api';

const PAGE_SIZE = 12;

const CATEGORY_CONFIG = {
  women: {
    apiValue: 'womens',
    label: "Women's",
    kicker: "THE WOMEN'S EDIT",
    description: 'Dresses, blazers, trousers & refined essentials for every occasion.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80',
  },
  men: {
    apiValue: 'mens',
    label: "Men's",
    kicker: "THE MEN'S EDIT",
    description: 'Tailored shirts, jackets, outerwear & refined essentials.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=80',
  },
  footwear: {
    apiValue: 'footwear',
    label: 'Footwear',
    kicker: 'STEP INTO STYLE',
    description: 'Sneakers, boots, loafers & sandals for every stride.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80',
  },
  accessories: {
    apiValue: 'accessories',
    label: 'Accessories',
    kicker: 'THE FINISHING TOUCH',
    description: 'Bags, belts, watches & the details that complete the look.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1400&q=80',
  },
  kids: {
    apiValue: 'kids',
    label: 'Kids',
    kicker: 'YOUNG & STYLISH',
    description: 'Playful, durable styles crafted for every age.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1400&q=80',
  },
};

export function generateStaticParams() {
  return Object.keys(CATEGORY_CONFIG).map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const config = CATEGORY_CONFIG[category];
  if (!config) return { title: 'LUMIÈRE' };
  return {
    title: `${config.label} — LUMIÈRE`,
    description: config.description,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params;
  const config = CATEGORY_CONFIG[category];
  if (!config) notFound();

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const sort = sp.sort || 'newest';
  const q = sp.q || '';

  const data = await safe(
    api.getProducts({
      category: config.apiValue,
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

  return (
    <>
      <Header variant="default" />
      <main className="bg-bg">

        <section className="relative min-h-[50vh] flex items-end overflow-hidden bg-dark">
          <Image
            src={config.image}
            alt={config.label}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />

          <div className="relative z-10 container-lux pb-16 pt-40">
            <nav className="mb-6 flex items-center gap-1.5 text-xs">
              <Link href="/" className="text-on-dark/40 hover:text-on-dark/70 transition-colors uppercase tracking-wide">
                Home
              </Link>
              <span className="text-on-dark/30">/</span>
              <Link href="/categories" className="text-on-dark/40 hover:text-on-dark/70 transition-colors uppercase tracking-wide">
                Categories
              </Link>
              <span className="text-on-dark/30">/</span>
              <span className="text-on-dark/70 uppercase tracking-wide">{config.label}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="u-label text-accent mb-3 tracking-widest">{config.kicker}</p>
                <h1 className="font-serif text-5xl md:text-6xl text-on-dark leading-tight">
                  {config.label}
                </h1>
                <p className="mt-3 text-on-dark/60 text-sm max-w-md leading-relaxed">
                  {config.description}
                </p>
              </div>
              <p className="text-on-dark/40 text-sm shrink-0">
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
              <FilterSidebar facets={facets} hideCategory />
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

              {total > 0 && (
                <p className="mb-6 text-sm text-muted">
                  Showing{' '}
                  <span className="font-medium text-ink">
                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
                  </span>{' '}
                  of <span className="font-medium text-ink">{total}</span>
                </p>
              )}

              <ProductGrid products={items} />

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} searchParams={sp} />
              )}
            </div>
          </div>
        </div>

        <section className="border-t border-line bg-surface py-14">
          <div className="container-lux flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="u-label text-muted mb-1">EXPLORE MORE</p>
              <h3 className="font-serif text-2xl text-ink">Shop All Categories</h3>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/shop"
                className="shrink-0 inline-block border border-ink text-ink text-xs font-semibold tracking-widest uppercase px-8 py-3 hover:bg-ink hover:text-white transition-colors"
              >
                All Products
              </Link>
              <Link
                href="/categories"
                className="shrink-0 inline-block bg-ink text-white text-xs font-semibold tracking-widest uppercase px-8 py-3 hover:bg-ink/90 transition-colors"
              >
                All Categories
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
