'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { ChevronDownIcon } from '@/components/icons';

export default function Accordion({ title, defaultOpen = false, children, className }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('border-t border-line', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="u-label text-ink">{title}</span>
        <ChevronDownIcon
          size={16}
          className={cn('text-ink transition-transform duration-300 ease-lux', open && 'rotate-180')}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-300 ease-lux',
          open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden text-sm leading-relaxed text-ink-soft">{children}</div>
      </div>
    </div>
  );
}
