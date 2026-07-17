import { cn } from '@/lib/cn';

export function formatPrice(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Price({ value, currency = 'USD', serif = false, className }) {
  return (
    <span className={cn(serif ? 'font-serif' : 'font-sans tabular-nums', className)}>
      {formatPrice(value, currency)}
    </span>
  );
}
