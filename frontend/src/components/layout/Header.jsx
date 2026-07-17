'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import SearchOverlay from './SearchOverlay';
import NotificationPanel from './NotificationPanel';

const STATIC_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Categories', href: '/categories' },
  { label: 'Sale', href: '/sale', accent: true },
];

export default function Header({ variant = 'default', step = 'checkout' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count: cartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useNotifications();
  const pathname = usePathname();
  const showNav = variant === 'default';
  const isCheckout = variant === 'checkout';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = STATIC_NAV;

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0]);

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 border-b border-outline-variant/30 backdrop-blur-sm',
        scrolled ? 'bg-surface/98 shadow-sm' : 'bg-surface/95'
      )}
    >
      <nav className="flex justify-between items-center max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop h-20">
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="font-headline-lg text-headline-lg text-primary tracking-tighter"
          >
            LUMIÈRE
          </Link>
        </div>

        {showNav && (
          <ul className="hidden lg:flex items-center space-x-gutter">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'text-[15px] font-semibold tracking-wide uppercase transition-colors duration-300',
                    isActive(item.href)
                      ? item.accent
                        ? 'text-secondary border-b-2 border-secondary pb-1'
                        : 'text-primary border-b-2 border-primary pb-1'
                      : item.accent
                      ? 'text-secondary hover:text-secondary/80'
                      : 'text-on-surface-variant hover:text-primary'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {isCheckout && (
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
            <span
              className={cn(
                'font-label-lg text-label-lg',
                step === 'checkout' ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              Checkout
            </span>
            <span className="font-label-lg text-label-lg text-on-surface-variant">/</span>
            <span
              className={cn(
                'font-label-lg text-label-lg',
                step === 'confirmation' ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              Confirmation
            </span>
          </div>
        )}

        <div className="flex items-center space-x-6">
          {showNav && (
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          )}
          {isAuthenticated && !isCheckout && (
            <div className="relative hidden md:block">
              <button
                aria-label="Notifications"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
          )}
          {!isCheckout && (
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="hidden md:block text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">favorite</span>
            </Link>
          )}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-on-primary">
                {cartCount}
              </span>
            )}
          </Link>
          {!isCheckout && (
            <Link
              href={
                !isAuthenticated ? '/login' : user?.role === 'admin' ? '/admin' : '/account'
              }
              aria-label={isAuthenticated ? 'My account' : 'Sign in'}
              className="hidden md:block text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">person</span>
            </Link>
          )}
          {showNav && (
            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden text-on-surface-variant"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          )}
        </div>
      </nav>

      {showNav && (
        <div
          className={cn(
            'fixed inset-0 z-50 lg:hidden',
            menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
          )}
        >
          <div
            onClick={() => setMenuOpen(false)}
            className={cn(
              'absolute inset-0 bg-primary/40 transition-opacity duration-300',
              menuOpen ? 'opacity-100' : 'opacity-0'
            )}
          />
          <nav
            className={cn(
              'absolute left-0 top-0 h-full w-72 max-w-[80%] bg-surface p-8 shadow-xl transition-transform duration-300',
              menuOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="mb-10 flex items-center justify-between">
              <Link
                href="/"
                className="font-headline-lg text-headline-lg text-primary tracking-tighter"
              >
                LUMIÈRE
              </Link>
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <ul className="space-y-6">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'font-label-lg text-label-lg transition-colors',
                      isActive(item.href)
                        ? item.accent ? 'text-secondary' : 'text-primary'
                        : item.accent
                        ? 'text-secondary hover:text-secondary/80'
                        : 'text-on-surface-variant hover:text-primary'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
