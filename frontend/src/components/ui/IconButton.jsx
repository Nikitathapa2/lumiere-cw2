import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const IconButton = forwardRef(function IconButton(
  { children, label, badge, className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center text-ink',
        'transition-opacity duration-300 ease-lux hover:opacity-60',
        className
      )}
      {...props}
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.5625rem] font-medium leading-none text-on-dark">
          {badge}
        </span>
      ) : null}
    </button>
  );
});

export default IconButton;
