import { cn } from '@/lib/cn';

export default function Pill({ selected = false, disabled = false, className, children, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'inline-flex min-w-[3rem] items-center justify-center rounded-none border px-3 py-2.5',
        'font-sans text-[0.8125rem] tracking-wide transition-colors duration-200',
        selected
          ? 'border-ink bg-ink text-on-dark'
          : 'border-line bg-surface text-ink hover:border-ink',
        disabled && 'cursor-not-allowed text-muted line-through opacity-50 hover:border-line',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
