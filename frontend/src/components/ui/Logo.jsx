import Link from 'next/link';
import { cn } from '@/lib/cn';

const sizes = {
  sm: 'text-lg tracking-[0.18em]',
  md: 'text-2xl tracking-[0.2em]',
  lg: 'text-4xl tracking-[0.22em]',
};

export default function Logo({ size = 'md', href = '/', className }) {
  return (
    <Link
      href={href}
      aria-label="LUMIÈRE home"
      className={cn('font-serif font-medium text-ink leading-none', sizes[size], className)}
    >
      LUMIÈRE
    </Link>
  );
}
