'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useNotifications } from '@/context/NotificationContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_ICON = {
  order_placed: 'shopping_bag',
  order_processing: 'sync',
  order_shipped: 'local_shipping',
  order_delivered: 'check_circle',
  order_cancelled: 'cancel',
  system: 'info',
};

export default function NotificationPanel({ open, onClose }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const panelRef = useRef(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className={cn(
        'absolute right-0 top-full mt-2 w-80 bg-surface border border-line shadow-xl z-50',
        'transition-all duration-200 origin-top-right',
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink">
          Notifications {unreadCount > 0 && <span className="ml-1 text-accent">({unreadCount})</span>}
        </span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-[10px] uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <ul className="max-h-80 overflow-y-auto divide-y divide-line">
        {notifications.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</li>
        )}
        {notifications.map((n) => (
          <li
            key={n._id}
            className={cn('px-4 py-3 flex gap-3 cursor-pointer hover:bg-bg transition-colors', !n.read && 'bg-bg/60')}
            onClick={() => { if (!n.read) markRead(n._id); }}
          >
            <span
              className="material-symbols-outlined mt-0.5 flex-shrink-0 text-lg"
              style={{ fontSize: '18px', color: n.read ? '#8A8A8A' : '#111' }}
            >
              {TYPE_ICON[n.type] || 'info'}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn('text-xs font-semibold leading-tight', n.read ? 'text-muted' : 'text-ink')}>
                {n.title}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft leading-relaxed">{n.message}</p>
              <p className="mt-1 text-[10px] text-muted">{timeAgo(n.createdAt)}</p>
            </div>
            {!n.read && <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />}
          </li>
        ))}
      </ul>

      {notifications.length > 0 && (
        <div className="border-t border-line px-4 py-2.5 text-center">
          <Link
            href="/account/orders"
            onClick={onClose}
            className="text-[10px] uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            View all orders
          </Link>
        </div>
      )}
    </div>
  );
}
