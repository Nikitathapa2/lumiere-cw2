'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';

export default function StepUpModal({ onGranted, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await api.stepUp(password);
      onGranted();
    } catch (err) {
      setError(err.message || 'Incorrect password.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="w-full max-w-sm border border-line bg-surface p-8">
        <p className="u-label mb-1 text-muted">Security check</p>
        <h2 className="font-serif text-2xl text-ink">Confirm your identity</h2>
        <p className="mt-2 text-sm text-ink-soft">
          This action requires you to re-enter your password.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />

          {error && <p className="text-sm text-accent">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" disabled={pending}>
              {pending ? 'Verifying…' : 'Confirm'}
            </Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
