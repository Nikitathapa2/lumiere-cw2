'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';

export default function SearchBar({ initialValue = '' }) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const submit = (query) => {
    const next = new URLSearchParams(params.toString());
    if (query.trim()) next.set('q', query.trim());
    else next.delete('q');
    next.delete('page');
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submit(value);
    if (e.key === 'Escape') {
      setValue('');
      submit('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setValue('');
    submit('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex items-center">
      <span
        className="material-symbols-outlined pointer-events-none absolute left-3 text-muted"
        style={{ fontSize: '18px' }}
      >
        search
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search products…"
        aria-label="Search products"
        className={cn(
          'w-full border border-line bg-surface py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-muted',
          'focus:border-ink focus:outline-none transition-colors'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 text-muted hover:text-ink transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            close
          </span>
        </button>
      )}
    </div>
  );
}
