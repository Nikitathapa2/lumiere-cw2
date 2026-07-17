'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import { Input, Checkbox } from '@/components/ui/Field';
import { cn } from '@/lib/cn';

function QuickLink({ href, icon, label, meta }) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 border border-line bg-surface p-5 hover:border-ink transition-colors duration-200"
    >
      <span
        className="material-symbols-outlined text-muted group-hover:text-ink transition-colors"
        style={{ fontSize: '22px' }}
      >
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink">{label}</p>
        {meta && <p className="mt-0.5 text-xs text-muted">{meta}</p>}
      </div>
      <span className="mt-auto text-[10px] uppercase tracking-widest text-muted group-hover:text-ink transition-colors">
        View →
      </span>
    </Link>
  );
}

export default function AccountOverviewPage() {
  const { user, setUser } = useAuth();
  const { slugs } = useWishlist();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    newsletter: user.newsletter,
  });
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: k === 'newsletter' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const { user: updated } = await api.updateProfile(form);
      setUser(updated);
      setStatus({ ok: true, message: 'Profile updated.' });
      setEditOpen(false);
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    }
    setPending(false);
  };

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const quickLinks = [
    {
      href: '/account/orders',
      icon: 'receipt_long',
      label: 'Orders',
      meta: 'Track & manage your orders',
    },
    {
      href: '/account/wishlist',
      icon: 'favorite',
      label: 'Wishlist',
      meta: `${slugs.length} saved item${slugs.length !== 1 ? 's' : ''}`,
    },
    {
      href: '/account/addresses',
      icon: 'location_on',
      label: 'Addresses',
      meta: `${user.addresses?.length || 0} saved address${(user.addresses?.length || 0) !== 1 ? 'es' : ''}`,
    },
    {
      href: '/account/settings',
      icon: 'lock',
      label: 'Security',
      meta: 'Change your password',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 border border-line bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center bg-ink font-serif text-xl text-white">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-2xl leading-tight">
            {user.firstName} {user.lastName}
          </h2>
          <p className="mt-0.5 text-sm text-muted">{user.email}</p>
          {memberSince && (
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted">
              Member since {memberSince}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => { setEditOpen((v) => !v); setStatus(null); }}
          className="flex-shrink-0 border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-ink-soft hover:border-ink hover:text-ink transition-colors"
        >
          {editOpen ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {editOpen && (
        <div className="border border-line bg-surface p-6 sm:p-8">
          <h3 className="mb-6 font-serif text-xl">Personal Details</h3>
          <form onSubmit={save} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input label="First Name" value={form.firstName} onChange={set('firstName')} required />
              <Input label="Last Name" value={form.lastName} onChange={set('lastName')} required />
            </div>
            <Input label="Email Address" type="email" value={form.email} onChange={set('email')} required />
            <Checkbox
              label="Receive exclusive access to new arrivals and curated collections."
              checked={form.newsletter}
              onChange={set('newsletter')}
            />
            {status && (
              <p className={cn('text-sm', status.ok ? 'text-accent' : 'text-red-600')}>
                {status.message}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
          Your Account
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickLinks.map((l) => (
            <QuickLink key={l.href} {...l} />
          ))}
        </div>
      </div>

      <div className="border border-line bg-surface p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl">Join the Collective</h3>
            <p className="mt-1 text-sm text-ink-soft">
              {user.newsletter
                ? 'You are subscribed to exclusive arrivals and editorial content.'
                : 'Subscribe for early access to new collections and editorial drops.'}
            </p>
          </div>
          <span
            className={cn(
              'flex-shrink-0 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest border',
              user.newsletter
                ? 'border-ink bg-ink text-white'
                : 'border-line text-muted'
            )}
          >
            {user.newsletter ? 'Subscribed' : 'Not subscribed'}
          </span>
        </div>
        {!user.newsletter && !editOpen && (
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="mt-5 text-xs font-semibold uppercase tracking-widest text-ink underline underline-offset-4 hover:opacity-60 transition-opacity"
          >
            Subscribe via Edit Profile →
          </button>
        )}
      </div>
    </div>
  );
}
