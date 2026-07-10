'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name' },
];

export default function SortSelect({ value = 'newest' }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const handleChange = (e) => {
    const next = new URLSearchParams(params.toString());
    if (e.target.value === 'newest') next.delete('sort');
    else next.set('sort', e.target.value);
    next.delete('page');
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="u-label text-muted hidden sm:block">Sort by:</span>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          className="border border-line bg-surface text-sm text-ink py-1.5 pl-3 pr-8 appearance-none cursor-pointer hover:border-ink transition-colors focus:outline-none focus:border-ink"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft"
          style={{ fontSize: '16px' }}
        >
          expand_more
        </span>
      </div>
    </div>
  );
}
