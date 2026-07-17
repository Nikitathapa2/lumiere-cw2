'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';
import ConfirmModal from '@/components/ui/ConfirmModal';

const NAV = [
  { label: 'Overview', href: '/account' },
  { label: 'Orders', href: '/account/orders' },
  { label: 'Wishlist', href: '/account/wishlist' },
  { label: 'Addresses', href: '/account/addresses' },
  { label: 'Settings', href: '/account/settings' },
  { label: 'Sessions', href: '/account/sessions' },
];

// Guards every /account/* page and provides the sidebar (§Batch 9).
export default function AccountShell({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [confirmSignout, setConfirmSignout] = useState(false);

  // Redirect unauthenticated visitors to login, preserving the destination.
  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return <div className="min-h-[50vh]" aria-hidden />;
  }

  const isActive = (href) =>
    href === '/account' ? pathname === '/account' : pathname.startsWith(href);

  const handleLogout = async () => {
    setConfirmSignout(false);
    await logout();
    router.push('/');
  };

  return (
    <div className="container-lux py-10 md:py-14">
      <div className="mb-8 border-b border-line pb-8">
        <p className="u-label text-muted">My Account</p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl">
          {user.firstName} {user.lastName}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[13rem_1fr] lg:gap-14">
        <aside>
          <nav className="flex flex-wrap gap-x-5 gap-y-1 lg:flex-col lg:gap-y-0">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block border-l-2 py-2 pl-3 text-xs font-semibold uppercase tracking-widest transition-colors',
                  isActive(item.href)
                    ? 'border-ink text-ink'
                    : 'border-transparent text-muted hover:border-line hover:text-ink'
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setConfirmSignout(true)}
              className="mt-6 block border-l-2 border-transparent py-2 pl-3 text-left text-xs font-semibold uppercase tracking-widest text-muted transition-colors hover:border-line hover:text-ink lg:mt-4 lg:border-t lg:border-l-0 lg:border-line lg:pl-0 lg:pt-4"
            >
              Sign Out
            </button>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>

      {confirmSignout && (
        <ConfirmModal
          title="Sign out?"
          message="You will be returned to the home page."
          confirmLabel="Sign Out"
          cancelLabel="Stay"
          onConfirm={handleLogout}
          onCancel={() => setConfirmSignout(false)}
        />
      )}
    </div>
  );
}
