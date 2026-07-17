import { cn } from '@/lib/cn';

export default function Swatch({ hex, name, selected = false, className, ...props }) {
  return (
    <button
      type="button"
      aria-label={name}
      aria-pressed={selected}
      title={name}
      className={cn(
        'h-6 w-6 rounded-full border border-line transition-shadow duration-200',
        selected && 'ring-1 ring-ink ring-offset-2 ring-offset-bg',
        className
      )}
      style={{ backgroundColor: hex }}
      {...props}
    />
  );
}
