import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const variants = {
  primary:
    'bg-ink text-on-dark border border-ink hover:bg-transparent hover:text-ink',
  secondary:
    'bg-surface text-ink border border-line hover:border-ink',
  ghost: 'bg-transparent text-ink border border-transparent hover:opacity-60',
  light:
    'bg-surface text-ink border border-transparent hover:bg-bg',
};

const sizes = {
  sm: 'px-5 py-2.5 text-[0.6875rem]',
  md: 'px-7 py-3.5 text-[0.75rem]',
  lg: 'px-9 py-4 text-[0.8125rem]',
  full: 'w-full px-7 py-4 text-[0.75rem]',
};

const base =
  'inline-flex items-center justify-center gap-2 font-sans uppercase tracking-wide rounded-none ' +
  'transition-colors duration-300 ease-lux disabled:opacity-40 disabled:pointer-events-none ' +
  'whitespace-nowrap select-none';

const Button = forwardRef(function Button(
  { as = 'button', variant = 'primary', size = 'md', href, className, children, ...props },
  ref
) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (as === 'link' || href) {
    return (
      <Link ref={ref} href={href || '#'} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});

export default Button;
