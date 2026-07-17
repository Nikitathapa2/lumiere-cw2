'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { ArrowRightIcon, ChevronLeftIcon } from '@/components/icons';


export default function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth();
  const token = params.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(false);

  const requestLink = async (e) => {
    e.preventDefault();
    setPending(true);
    try {
      await api.forgotPassword(email);
      setStatus({ ok: true, message: 'If an account exists, a reset link is on its way.' });
    } catch (err) {
      setStatus({ ok: false, message: err.message || 'Something went wrong.' });
    }
    setPending(false);
  };

  const setNewPassword = async (e) => {
    e.preventDefault();
    setPending(true);
    try {
      const { user } = await api.resetPassword(token, password);
      setUser(user);
      router.push('/');
    } catch (err) {
      setStatus({ ok: false, message: err.message || 'Unable to reset password.' });
      setPending(false);
    }
  };

  return (
    <div className="text-center">
      <h1 className="font-serif text-3xl">Reset Password</h1>
      <p className="mt-3 text-sm text-ink-soft">
        {token ? 'Choose a new password for your account.' : 'Enter your email to receive a reset link.'}
      </p>

      {token ? (
        <form onSubmit={setNewPassword} className="mt-8 space-y-5 text-left">
          <Input
            label="New Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="primary" size="full" disabled={pending}>
            {pending ? 'Updating…' : 'Update Password'} <ArrowRightIcon size={16} />
          </Button>
        </form>
      ) : (
        <form onSubmit={requestLink} className="mt-8 space-y-5 text-left">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="primary" size="full" disabled={pending}>
            {pending ? 'Sending…' : 'Send Reset Link'} <ArrowRightIcon size={16} />
          </Button>
        </form>
      )}

      {status ? (
        <p className={`mt-4 text-sm ${status.ok ? 'text-accent' : 'text-accent'}`}>{status.message}</p>
      ) : null}

      <Link
        href="/login"
        className="u-label mt-8 inline-flex items-center gap-1 text-ink-soft hover:text-ink"
      >
        <ChevronLeftIcon size={14} /> Back to Login
      </Link>
    </div>
  );
}
