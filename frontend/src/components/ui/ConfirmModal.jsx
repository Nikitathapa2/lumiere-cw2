'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  // Close on Escape.
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-hidden
      />

      <div className="relative w-full max-w-sm bg-surface border border-line p-8 shadow-2xl">
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        {message && (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{message}</p>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'flex-1 py-3 text-xs font-semibold uppercase tracking-widest transition-colors',
              danger
                ? 'bg-ink text-white hover:bg-red-700'
                : 'bg-ink text-white hover:bg-ink/80'
            )}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-line py-3 text-xs font-semibold uppercase tracking-widest text-ink-soft hover:text-ink transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
