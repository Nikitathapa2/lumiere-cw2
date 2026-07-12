'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import StepUpModal from '@/components/auth/StepUpModal';
import MfaSettings from '@/components/account/MfaSettings';

export default function SettingsPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(false);
  const [needsStepUp, setNeedsStepUp] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const doChangePassword = async () => {
    setPending(true);
    setStatus(null);
    try {
      await api.changePassword(form.currentPassword, form.newPassword);
      setStatus({ ok: true, message: 'Password updated.' });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      if (err.code === 'STEP_UP_REQUIRED') {
        setNeedsStepUp(true);
      } else {
        setStatus({ ok: false, message: err.message });
      }
    } finally {
      setPending(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setStatus({ ok: false, message: 'New passwords do not match.' });
      return;
    }
    await doChangePassword();
  };

  const handleStepUpGranted = async () => {
    setNeedsStepUp(false);
    await doChangePassword();
  };

  return (
    <section className="max-w-md">
      <h2 className="font-serif text-2xl">Settings</h2>
      <p className="mt-2 text-sm text-ink-soft">Update your password.</p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <Input label="Current Password" type="password" value={form.currentPassword} onChange={set('currentPassword')} required />
        <Input label="New Password" type="password" value={form.newPassword} onChange={set('newPassword')} required />
        <Input label="Confirm New Password" type="password" value={form.confirm} onChange={set('confirm')} required />

        {status && (
          <p className={`text-sm ${status.ok ? 'text-ink-soft' : 'text-accent'}`}>
            {status.message}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Updating…' : 'Update Password'}
        </Button>
      </form>

      {needsStepUp && (
        <StepUpModal
          onGranted={handleStepUpGranted}
          onCancel={() => setNeedsStepUp(false)}
        />
      )}

      <MfaSettings />
    </section>
  );
}
