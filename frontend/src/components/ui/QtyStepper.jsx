'use client';

import { cn } from '@/lib/cn';
import { PlusIcon, MinusIcon } from '@/components/icons';

export default function QtyStepper({ value = 1, min = 1, max = 99, onChange, className }) {
  const set = (next) => {
    const clamped = Math.max(min, Math.min(max, next));
    onChange?.(clamped);
  };

  return (
    <div className={cn('inline-flex items-center border border-line', className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => set(value - 1)}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-bg disabled:opacity-30"
      >
        <MinusIcon size={16} />
      </button>
      <span className="w-9 select-none text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-bg disabled:opacity-30"
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
