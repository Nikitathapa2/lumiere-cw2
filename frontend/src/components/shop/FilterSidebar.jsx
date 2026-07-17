'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';

const CATEGORIES = [
  { value: 'womens', label: 'Women' },
  { value: 'mens', label: 'Men' },
  { value: 'kids', label: 'Kids' },
  { value: 'accessories', label: 'Accessories' },
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL'];

const COLOR_OPTIONS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#EEEEEE' },
  { name: 'Charcoal', hex: '#666666' },
  { name: 'Olive', hex: '#4A4A2A' },
  { name: 'Red', hex: '#C0392B' },
];

const MAX_PRICE = 2000;

export default function FilterSidebar({ facets = {}, hideCategory = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [pending, setPending] = useState({
    category: params.get('category') || '',
    size: params.get('size') || '',
    color: params.get('color') || '',
    maxPrice: parseInt(params.get('maxPrice'), 10) || MAX_PRICE,
  });

  const toggleCategory = (value) =>
    setPending((p) => ({ ...p, category: p.category === value ? '' : value }));

  const toggleSize = (value) =>
    setPending((p) => ({ ...p, size: p.size === value ? '' : value }));

  const toggleColor = (hex) =>
    setPending((p) => ({ ...p, color: p.color.toLowerCase() === hex.toLowerCase() ? '' : hex }));

  const applyFilters = () => {
    const next = new URLSearchParams();
    if (pending.category) next.set('category', pending.category);
    if (pending.size) next.set('size', pending.size);
    if (pending.color) next.set('color', pending.color);
    if (pending.maxPrice < MAX_PRICE) next.set('maxPrice', String(pending.maxPrice));
    const sort = params.get('sort');
    if (sort) next.set('sort', sort);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <aside className="w-full lg:w-60 lg:shrink-0">
      <div className="mb-6 pb-5 border-b border-line">
        <h2 className="text-xl font-semibold text-ink">Filters</h2>
        <p className="mt-1 text-sm text-muted">Refine your selection</p>
      </div>

      {!hideCategory && <div className="mb-6 pb-6 border-b border-line">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-ink-soft" style={{ fontSize: '18px' }}>
            category
          </span>
          <h3 className="u-label text-ink">Category</h3>
        </div>
        <ul className="space-y-3">
          {CATEGORIES.map((cat) => {
            const active = pending.category === cat.value;
            return (
              <li key={cat.value}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className="flex items-center gap-3 w-full group"
                >
                  <div
                    className={cn(
                      'h-[18px] w-[18px] border flex items-center justify-center flex-shrink-0 transition-colors',
                      active
                        ? 'bg-ink border-ink'
                        : 'border-line bg-surface group-hover:border-ink-soft'
                    )}
                  >
                    {active && (
                      <span
                        className="material-symbols-outlined text-white"
                        style={{ fontSize: '12px' }}
                      >
                        check
                      </span>
                    )}
                  </div>
                  <span className={cn('text-sm', active ? 'font-medium text-ink' : 'text-ink-soft')}>
                    {cat.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>}

      <div className="mb-6 pb-6 border-b border-line">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-ink-soft" style={{ fontSize: '18px' }}>
            sell
          </span>
          <h3 className="u-label text-ink">Price Range</h3>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={50}
          value={pending.maxPrice}
          onChange={(e) =>
            setPending((p) => ({ ...p, maxPrice: parseInt(e.target.value, 10) }))
          }
          className="price-range-input w-full"
        />
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>$0</span>
          <span>
            {pending.maxPrice >= MAX_PRICE
              ? '$2,000+'
              : `$${pending.maxPrice.toLocaleString()}`}
          </span>
        </div>
      </div>

      <div className="mb-6 pb-6 border-b border-line">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-ink-soft" style={{ fontSize: '18px' }}>
            straighten
          </span>
          <h3 className="u-label text-ink">Size</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((s) => {
            const active = pending.size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={cn(
                  'h-9 min-w-[2.5rem] px-2 border text-xs font-medium transition-colors',
                  active
                    ? 'bg-ink border-ink text-white'
                    : 'bg-surface border-line text-ink-soft hover:border-ink'
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-ink-soft" style={{ fontSize: '18px' }}>
            palette
          </span>
          <h3 className="u-label text-ink">Color Palette</h3>
        </div>
        <div className="flex gap-3">
          {COLOR_OPTIONS.map((c) => {
            const active = pending.color.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => toggleColor(c.hex)}
                title={c.name}
                className={cn(
                  'h-7 w-7 rounded-full border-2 transition-all',
                  active ? 'border-ink scale-110' : 'border-transparent hover:border-ink-soft',
                  c.hex === '#EEEEEE' && 'border border-line'
                )}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={applyFilters}
        className="w-full bg-ink text-white text-xs font-semibold tracking-widest uppercase py-3 hover:bg-ink/90 transition-colors"
      >
        Apply Filters
      </button>
    </aside>
  );
}
