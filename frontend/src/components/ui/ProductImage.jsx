'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';


export default function ProductImage({
  src,
  alt = '',
  fill = true,
  sizes,
  priority = false,
  className,
  fallbackClassName,
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div
        role="img"
        aria-label={alt || 'Image unavailable'}
        className={cn(
          'flex h-full w-full select-none items-center justify-center bg-line',
          fallbackClassName
        )}
      >
        <span className="font-serif text-sm tracking-[0.25em] text-muted">LUMIÈRE</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
