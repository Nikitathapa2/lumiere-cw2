import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { api, safe } from '@/lib/api';

export const metadata = {
  title: 'Browse Categories — LUMIÈRE',
  description: 'Explore LUMIÈRE by category — Womens, Mens, Kids, Footwear, Accessories and more.',
};

const PRIMARY_CATEGORIES = [
  {
    key: 'womens',
    label: "Women's",
    description: 'Dresses, blazers, trousers & refined essentials',
    href: '/women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
    span: 'featured',
  },
  {
    key: 'mens',
    label: "Men's",
    description: 'Tailored shirts, jackets, outerwear & more',
    href: '/men',
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900&q=80',
  },
  {
    key: 'accessories',
    label: 'Accessories',
    description: 'Bags, belts, watches & finishing details',
    href: '/accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80',
  },
  {
    key: 'footwear',
    label: 'Footwear',
    description: 'Sneakers, boots, loafers & sandals',
    href: '/footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80',
  },
  {
    key: 'kids',
    label: 'Kids',
    description: 'Playful, durable styles for every age',
    href: '/kids',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=900&q=80',
  },
];

const NEW_ARRIVALS = {
  key: 'new-arrivals',
  label: 'New Arrivals',
  description: 'The latest drops — seasonal picks just landed',
  href: '/shop?sort=newest',
  image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=80',
};

const SUBCATEGORIES = [
  { label: 'Outerwear', href: '/shop?category=outerwear' },
  { label: 'Knitwear', href: '/shop?category=knitwear' },
  { label: 'Dresses', href: '/shop?category=dresses' },
  { label: 'Trousers', href: '/shop?category=trousers' },
  { label: 'Fragrance', href: '/shop?category=fragrance' },
  { label: 'New Arrivals', href: '/shop?sort=newest&isNew=true' },
  { label: 'On Sale', href: '/sale' },
];


export default async function CategoriesPage() {
  const data = await safe(api.getProducts({ limit: 1 }), { facets: {} });
  const counts = data?.facets || {};

  const [featured, ...rest] = PRIMARY_CATEGORIES;

  return (
    <>
      <Header variant="default" />
      <main className="bg-bg">

        <section className="bg-dark pt-36 pb-16">
          <div className="container-lux">
            <nav className="mb-6 flex items-center gap-1.5 text-xs">
              <Link href="/" className="text-on-dark/40 hover:text-on-dark/70 transition-colors uppercase tracking-wide">
                Home
              </Link>
              <span className="text-on-dark/30">/</span>
              <span className="text-on-dark/60 uppercase tracking-wide">Categories</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="u-label text-accent mb-3 tracking-widest">NAVIGATE THE EDIT</p>
                <h1 className="font-serif text-5xl md:text-6xl text-on-dark leading-tight">
                  Shop by Category
                </h1>
              </div>
              <p className="text-on-dark/40 text-sm max-w-xs leading-relaxed md:text-right">
                Every style, season, and occasion — organised so you can find exactly what
                you need.
              </p>
            </div>
          </div>
        </section>

        <section className="container-lux py-14">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">

            <div className="lg:col-span-2">
              <CategoryCard
                category={featured}
                count={counts[featured.key]}
                imageClass="aspect-[4/3] md:aspect-[16/9]"
                titleSize="text-4xl"
              />
            </div>

            <div className="flex flex-col gap-5">
              {rest.slice(0, 2).map((cat) => (
                <CategoryCard
                  key={cat.key}
                  category={cat}
                  count={counts[cat.key]}
                  imageClass="aspect-[16/9] md:aspect-[4/3]"
                  titleSize="text-2xl"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {rest.slice(2).map((cat) => (
              <CategoryCard
                key={cat.key}
                category={cat}
                count={counts[cat.key]}
                imageClass="aspect-[3/4]"
                titleSize="text-2xl"
              />
            ))}

            <CategoryCard
              category={NEW_ARRIVALS}
              count={null}
              imageClass="aspect-[3/4]"
              titleSize="text-2xl"
              accent
            />
          </div>
        </section>

        <section className="border-t border-line bg-surface">
          <div className="container-lux py-10">
            <p className="u-label text-muted mb-6">QUICK NAVIGATE</p>
            <div className="flex flex-wrap gap-3">
              {SUBCATEGORIES.map((sub) => (
                <Link
                  key={sub.label}
                  href={sub.href}
                  className="inline-block border border-line bg-bg text-ink text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-ink hover:text-white hover:border-ink transition-all"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-dark py-20 text-center">
          <p className="u-label text-accent mb-3 tracking-widest">THE FULL EDIT</p>
          <h2 className="font-serif text-4xl text-on-dark mb-5">
            Not Sure Where to Start?
          </h2>
          <p className="text-on-dark/50 text-sm max-w-sm mx-auto leading-relaxed mb-10">
            Browse every piece across all categories — use filters to narrow by size,
            colour, and price.
          </p>
          <Link
            href="/collections"
            className="inline-block bg-white text-ink text-xs font-semibold tracking-widest uppercase px-10 py-4 hover:bg-bg transition-colors"
          >
            Browse All Products
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ── CategoryCard ─────────────────────────────────────────── */

function CategoryCard({ category, count, imageClass, titleSize, accent }) {
  return (
    <Link
      href={category.href}
      className="group relative block overflow-hidden"
    >
      <div className={`relative ${imageClass} overflow-hidden bg-dark/10`}>
        <Image
          src={category.image}
          alt={category.label}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/75 via-dark/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          {accent && (
            <p className="u-label text-accent-bg mb-2">JUST LANDED</p>
          )}
          <h2 className={`font-serif ${titleSize} text-white leading-tight`}>
            {category.label}
          </h2>
          <p className="mt-1 text-xs text-white/60 leading-relaxed hidden sm:block max-w-xs">
            {category.description}
          </p>
          <div className="mt-3 flex items-center gap-3">
            {count != null && (
              <span className="u-label text-white/50">
                {count} {count === 1 ? 'Item' : 'Items'}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
              Shop Now
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                arrow_forward
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
