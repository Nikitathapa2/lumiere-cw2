'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Input, Checkbox } from '@/components/ui/Field';
import SocialButtons from './SocialButtons';
import { ArrowRightIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 5);
}

const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-500', 'bg-green-500'];

function PasswordStrengthMeter({ password }) {
  const score = useMemo(() => scorePassword(password), [password]);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-sm transition-colors',
              i <= score ? STRENGTH_COLORS[score] : 'bg-line'
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted">{STRENGTH_LABELS[score]}</p>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    newsletter: false,
  });
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: k === 'newsletter' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await register(form);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Unable to create your account.');
      setPending(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl">Create Account</h1>
      <p className="mt-2 text-sm text-ink-soft">Please enter your details to join LUMIÈRE.</p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" variant="underline" placeholder="E.g. Elena" required value={form.firstName} onChange={set('firstName')} />
          <Input label="Last Name" variant="underline" placeholder="E.g. Rossi" required value={form.lastName} onChange={set('lastName')} />
        </div>
        <Input label="Email Address" type="email" variant="underline" placeholder="elena@studio.com" required value={form.email} onChange={set('email')} />

        <div>
          <Input label="Password" type="password" variant="underline" required value={form.password} onChange={set('password')} />
          <PasswordStrengthMeter password={form.password} />
          {!form.password && (
            <p className="mt-1 text-xs text-muted">
              Use 12+ characters with uppercase, numbers, and symbols.
            </p>
          )}
        </div>

        <Checkbox
          label="Subscribe to our newsletter for exclusive access to new curations and atelier events."
          checked={form.newsletter}
          onChange={set('newsletter')}
        />

        {error ? <p className="text-sm text-accent">{error}</p> : null}

        <Button type="submit" variant="primary" size="full" disabled={pending}>
          {pending ? 'Creating…' : 'Create Account'} <ArrowRightIcon size={16} />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link href="/login" className="u-label text-ink underline-offset-4 hover:underline">
          Login
        </Link>
      </p>

      <SocialButtons label="Or continue with" />
    </div>
  );
}
