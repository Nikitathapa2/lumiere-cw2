'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

const QUICK_LINKS = [
  { label: "Women's", href: '/collections?category=womens' },
  { label: "Men's", href: '/collections?category=mens' },
  { label: 'Kids', href: '/collections?category=kids' },
  { label: 'Footwear', href: '/collections?category=footwear' },
  { label: 'Accessories', href: '/collections?category=accessories' },
  { label: 'New Arrivals', href: '/collections?isNew=true' },
];

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSearch = () => {
    if (!query.trim()) return;
    onClose();
    router.push(`/collections?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleQuickLink = (href) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          'fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={cn(
          'fixed left-0 right-0 top-20 z-50 bg-surface border-b border-line',
          'transition-all duration-300',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        )}
      >
        <div className="container-lux section py-6 md:py-8">
          <div className="relative flex items-center gap-3">
            <span
              className="material-symbols-outlined text-muted flex-shrink-0"
              style={{ fontSize: '22px' }}
            >
              search
            </span>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search for products, styles, categories…"
              className={cn(
                'flex-1 bg-transparent py-2 text-lg text-ink placeholder:text-muted',
                'border-b border-line focus:border-ink focus:outline-none transition-colors'
              )}
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear"
                className="flex-shrink-0 text-muted hover:text-ink transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleSearch}
              disabled={!query.trim()}
              aria-label="Submit search"
              className={cn(
                'flex-shrink-0 text-xs font-semibold uppercase tracking-widest',
                'border border-ink px-4 py-2 transition-colors',
                query.trim()
                  ? 'bg-ink text-white hover:bg-transparent hover:text-ink'
                  : 'border-line text-muted cursor-not-allowed'
              )}
            >
              Search
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="u-label text-muted mr-1">Browse:</span>
            {QUICK_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleQuickLink(link.href)}
                className="border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
