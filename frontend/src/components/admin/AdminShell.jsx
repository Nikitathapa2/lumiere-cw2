'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';
import ConfirmModal from '@/components/ui/ConfirmModal';
import StepUpModal from '@/components/auth/StepUpModal';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Wallet', href: '/admin/wallet', icon: 'account_balance_wallet' },
  { label: 'Transactions', href: '/admin/transactions', icon: 'payments' },
  { label: 'Orders', href: '/admin/orders', icon: 'receipt_long' },
  { label: 'Users', href: '/admin/users', icon: 'group' },
  { label: 'Audit Log', href: '/admin/audit', icon: 'security' },
];

export default function AdminShell({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [confirmSignout, setConfirmSignout] = useState(false);
  const [needsStepUp, setNeedsStepUp] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login?redirect=/admin'); return; }
    if (user.role !== 'admin') { router.replace('/'); }
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="min-h-[60vh]" aria-hidden />;
  }

  if (typeof window !== 'undefined') {
    window.__adminRequestStepUp = () => setNeedsStepUp(true);
  }

  const isActive = (href) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const handleSignOut = async () => {
    setConfirmSignout(false);
    await logout();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-56 flex-shrink-0 border-r border-line bg-surface md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-line px-5">
          <Link href="/" className="font-serif text-lg tracking-widest text-ink">
            LUMIÈRE
          </Link>
          <span className="ml-2 text-[9px] uppercase tracking-widest text-muted border border-muted px-1 py-px">
            Admin
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors',
                isActive(item.href)
                  ? 'bg-ink text-white'
                  : 'text-ink-soft hover:bg-bg hover:text-ink'
              )}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-line px-3 py-4">
          <p className="px-3 text-xs text-muted truncate">{user.email}</p>
          <button
            type="button"
            onClick={() => setConfirmSignout(true)}
            className="mt-2 flex w-full items-center gap-3 rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted hover:bg-bg hover:text-ink transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-6">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-ink">
            {NAV.find((n) => isActive(n.href))?.label ?? 'Admin'}
          </h1>
          <Link href="/" className="text-xs text-muted hover:text-ink transition-colors uppercase tracking-widest">
            ← Store
          </Link>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {confirmSignout && (
        <ConfirmModal
          title="Sign out?"
          message="You will be redirected to the store."
          confirmLabel="Sign Out"
          cancelLabel="Stay"
          onConfirm={handleSignOut}
          onCancel={() => setConfirmSignout(false)}
        />
      )}

      {needsStepUp && (
        <StepUpModal
          onGranted={() => setNeedsStepUp(false)}
          onCancel={() => { setNeedsStepUp(false); router.push('/'); }}
        />
      )}
    </div>
  );
}
