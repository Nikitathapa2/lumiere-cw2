'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const CATEGORIES = [
  {
    key: 'womens',
    label: "Women's",
    description: 'Dresses, tops, outerwear & more',
    href: '/collections?category=womens',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80',
  },
  {
    key: 'mens',
    label: "Men's",
    description: 'Shirts, jackets, trousers & more',
    href: '/collections?category=mens',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80',
  },
  {
    key: 'kids',
    label: 'Kids',
    description: 'Playful styles for every age',
    href: '/collections?category=kids',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=900&q=80',
  },
  {
    key: 'footwear',
    label: 'Footwear',
    description: 'Sneakers, boots & sandals',
    href: '/collections?category=footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80',
  },
  {
    key: 'accessories',
    label: 'Accessories',
    description: 'Bags, belts, watches & more',
    href: '/collections?category=accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80',
  },
  {
    key: 'new-arrivals',
    label: 'New Arrivals',
    description: 'The latest drops & seasonal picks',
    href: '/collections?isNew=true',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80',
  },
];

function CategoryCard({ category, count }) {
  return (
    <Link
      href={category.href}
      className="group relative block flex-shrink-0 overflow-hidden"
      style={{ width: 'clamp(220px, 30vw, 340px)' }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-line">
        <Image
          src={category.image}
          alt={category.label}
          fill
          sizes="(max-width: 768px) 70vw, 30vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="font-serif text-2xl text-white leading-tight">{category.label}</p>
          <p className="mt-1 text-xs text-white/70 uppercase tracking-widest">
            {count != null ? `${count} Items` : category.description}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs text-white/80 uppercase tracking-widest transition-colors group-hover:text-white">
            Shop Now
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryCarousel({ counts = {} }) {
  return (
    <div className="relative">
      <div
        className="flex gap-4 overflow-x-auto pb-4 md:gap-6"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {CATEGORIES.map((cat) => (
          <div key={cat.key} style={{ scrollSnapAlign: 'start' }}>
            <CategoryCard
              category={cat}
              count={counts[cat.key] ?? null}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-bg to-transparent md:hidden" />
    </div>
  );
}
