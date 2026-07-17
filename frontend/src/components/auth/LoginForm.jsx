'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import TextLink from '@/components/ui/TextLink';
import SocialButtons from './SocialButtons';

const OAUTH_ERROR_MESSAGES = {
  oauth_state: 'Your sign-in link expired or was invalid. Please try again.',
  oauth_exchange: 'Google sign-in failed. Please try again.',
};

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, verifyMfa } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(() => OAUTH_ERROR_MESSAGES[params.get('error')] || null);
  const [locked, setLocked] = useState(null);
  const [pending, setPending] = useState(false);

  const [challenge, setChallenge] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [mfaError, setMfaError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const redirectAfterLogin = (u) => {
    if (u.role === 'admin') {
      router.push('/admin');
    } else {
      router.push(params.get('redirect') || '/');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setLocked(null);
    try {
      const res = await login(form.email, form.password);
      if (res.mfaRequired) {
        setChallenge(res.challenge);
        setPending(false);
        return;
      }
      redirectAfterLogin(res);
    } catch (err) {
      if (err.status === 423) {
        setLocked({ message: err.message });
      } else {
        setError(err.message || 'Unable to sign in.');
      }
      setPending(false);
    }
  };

  const submitMfa = async (e) => {
    e.preventDefault();
    setPending(true);
    setMfaError(null);
    try {
      const u = await verifyMfa(challenge, useRecovery ? { recoveryCode: mfaCode } : { token: mfaCode });
      redirectAfterLogin(u);
    } catch (err) {
      setMfaError(err.message || 'Invalid authentication code.');
      setPending(false);
    }
  };

  if (challenge) {
    return (
      <div>
        <h1 className="font-serif text-3xl">Two-factor authentication</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {useRecovery
            ? 'Enter one of your saved recovery codes.'
            : 'Enter the 6-digit code from your authenticator app.'}
        </p>

        <form onSubmit={submitMfa} className="mt-8 space-y-6">
          <Input
            label={useRecovery ? 'Recovery Code' : 'Authentication Code'}
            variant="underline"
            required
            autoFocus
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            inputMode={useRecovery ? 'text' : 'numeric'}
            maxLength={useRecovery ? undefined : 6}
          />

          {mfaError && <p className="text-sm text-accent">{mfaError}</p>}

          <Button type="submit" variant="primary" size="full" disabled={pending || !mfaCode}>
            {pending ? 'Verifying…' : 'Verify'}
          </Button>
        </form>

        <button
          type="button"
          className="mt-6 text-xs uppercase tracking-wide text-muted underline-offset-4 hover:underline"
          onClick={() => {
            setUseRecovery((v) => !v);
            setMfaCode('');
            setMfaError(null);
          }}
        >
          {useRecovery ? 'Use authenticator code instead' : 'Use a recovery code instead'}
        </button>
      </div>
    );
  }

  return (
    <>
      {pending && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-surface/95 backdrop-blur-sm">
          <p className="font-serif text-3xl tracking-widest text-ink">LUMIÈRE</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted animate-pulse">
            Signing in, please wait…
          </p>
        </div>
      )}
      <div>
        <h1 className="font-serif text-3xl">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Please enter your details to access your curated collection.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-6">
          <Input label="Email Address" type="email" variant="underline" required value={form.email} onChange={set('email')} />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="u-label text-ink-soft">Password</span>
              <TextLink href="/reset-password" className="border-0 pb-0 text-muted hover:opacity-60">
                Forgot Password?
              </TextLink>
            </div>
            <Input type="password" variant="underline" required value={form.password} onChange={set('password')} />
          </div>

          {locked && (
            <div className="border border-line bg-bg p-3">
              <p className="text-sm font-semibold text-ink">Account temporarily locked</p>
              <p className="mt-1 text-xs text-ink-soft">{locked.message}</p>
              <p className="mt-1 text-xs text-muted">
                Use <Link href="/reset-password" className="underline">Forgot Password</Link> to regain access immediately.
              </p>
            </div>
          )}

          {error && !locked && <p className="text-sm text-accent">{error}</p>}

          <Button type="submit" variant="primary" size="full" disabled={pending || !!locked}>
            {pending ? 'Signing In…' : 'Sign In'}
          </Button>
        </form>

        <SocialButtons label="Or sign in with" />

        <p className="mt-8 text-center text-sm text-ink-soft">
          New to LUMIÈRE?{' '}
          <Link href="/register" className="u-label text-ink underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </>
  );
}
