'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { EyeIcon, EyeOffIcon, ChevronDownIcon } from '@/components/icons';

export function Label({ htmlFor, children, className }) {
  return (
    <label htmlFor={htmlFor} className={cn('u-label mb-2 block text-ink-soft', className)}>
      {children}
    </label>
  );
}

const fieldBase =
  'w-full bg-transparent font-sans text-[0.9375rem] text-ink placeholder:text-muted ' +
  'outline-none transition-colors duration-200';

const fieldStyles = {
  bordered: 'rounded-none border border-line bg-surface px-4 py-3 focus:border-ink',
  underline: 'rounded-none border-0 border-b border-line px-0 py-2.5 focus:border-ink',
};

export function Input({
  label,
  variant = 'bordered',
  type = 'text',
  className,
  containerClassName,
  id,
  ...props
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && show ? 'text' : type;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <div className="relative">
        <input
          id={fieldId}
          type={inputType}
          className={cn(fieldBase, fieldStyles[variant], isPassword && 'pr-9', className)}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
          >
            {show ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Select({ label, variant = 'bordered', className, containerClassName, id, children, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <div className="relative">
        <select
          id={fieldId}
          className={cn(
            fieldBase,
            fieldStyles[variant],
            'appearance-none pr-9',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}

export function Checkbox({ label, id, className, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <label htmlFor={fieldId} className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input
        id={fieldId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-none border border-line bg-surface
                   checked:border-ink checked:bg-ink
                   checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m5 12 5 5L20 7%22/></svg>')]
                   bg-[length:12px] bg-center bg-no-repeat
                   focus-visible:outline-1"
        {...props}
      />
      {label ? <span className="text-sm leading-snug text-ink-soft">{label}</span> : null}
    </label>
  );
}
