'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import StepUpModal from '@/components/auth/StepUpModal';


export default function MfaSettings() {
  const { user, refresh } = useAuth();
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [needsStepUp, setNeedsStepUp] = useState(false);

  const runWithStepUp = async (action, fn) => {
    setStatus(null);
    setPending(true);
    try {
      await fn();
    } catch (err) {
      if (err.code === 'STEP_UP_REQUIRED') {
        setPendingAction(action);
        setNeedsStepUp(true);
      } else {
        setStatus({ ok: false, message: err.message });
      }
    } finally {
      setPending(false);
    }
  };

  const startSetup = () =>
    runWithStepUp('setup', async () => {
      const res = await api.setupMfa();
      setSetupData(res);
    });

  const disable = () =>
    runWithStepUp('disable', async () => {
      await api.disableMfa();
      await refresh();
      setStatus({ ok: true, message: 'Two-factor authentication disabled.' });
    });

  const handleStepUpGranted = async () => {
    setNeedsStepUp(false);
    if (pendingAction === 'setup') await startSetup();
    if (pendingAction === 'disable') await disable();
  };

  const confirmEnable = async (e) => {
    e.preventDefault();
    setStatus(null);
    setPending(true);
    try {
      const res = await api.enableMfa(code);
      setRecoveryCodes(res.recoveryCodes);
      setSetupData(null);
      setCode('');
      await refresh();
    } catch (err) {
      setStatus({ ok: false, message: err.message });
    } finally {
      setPending(false);
    }
  };

  const finishRecoveryCodes = () => {
    setRecoveryCodes(null);
    setStatus({ ok: true, message: 'Two-factor authentication is now enabled.' });
  };

  return (
    <section className="max-w-md border-t border-line pt-8">
      <h2 className="font-serif text-2xl">Two-Factor Authentication</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Require a code from an authenticator app in addition to your password when signing in.
      </p>

      {status && (
        <p className={`mt-4 text-sm ${status.ok ? 'text-ink-soft' : 'text-accent'}`}>{status.message}</p>
      )}

      {recoveryCodes ? (
        <div className="mt-6 border border-line bg-bg p-5">
          <p className="u-label text-ink">Save your recovery codes</p>
          <p className="mt-2 text-xs text-ink-soft">
            Each code can be used once to sign in if you lose access to your authenticator app.
            Store them somewhere safe — they won&apos;t be shown again.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm text-ink">
            {recoveryCodes.map((c) => (
              <span key={c} className="border border-line bg-surface px-2 py-1">{c}</span>
            ))}
          </div>
          <Button variant="primary" size="sm" className="mt-5" onClick={finishRecoveryCodes}>
            I&apos;ve saved these codes
          </Button>
        </div>
      ) : setupData ? (
        <form onSubmit={confirmEnable} className="mt-6 space-y-5 border border-line bg-bg p-5">
          <div>
            <p className="u-label text-ink">1. Scan with your authenticator app</p>
            <p className="mt-2 text-xs text-ink-soft">
              Use Google Authenticator, Authy, Microsoft Authenticator, or any other TOTP app to scan this QR code:
            </p>
            <div className="mt-4 flex justify-center">
              {setupData.otpauthUrl && (
                <QRCodeSVG
                  value={setupData.otpauthUrl}
                  level="H"
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#111111"
                />
              )}
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <p className="u-label text-ink">Or enter this key manually</p>
            <p className="mt-2 text-xs text-ink-soft">If you can&apos;t scan the QR code, enter this key manually:</p>
            <p className="mt-2 break-all border border-line bg-surface px-3 py-2 font-mono text-sm text-ink">
              {setupData.secret}
            </p>
          </div>

          <div className="border-t border-line pt-4">
            <p className="u-label text-ink">2. Enter the 6-digit code</p>
            <p className="mt-2 text-xs text-ink-soft">Once you&apos;ve added your account, enter the 6-digit code from your app:</p>
            <Input
              className="mt-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              required
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={pending || code.length !== 6}>
              {pending ? 'Confirming…' : 'Confirm & Enable'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setSetupData(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : user?.mfaEnabled ? (
        <div className="mt-6 flex items-center justify-between border border-line bg-bg p-5">
          <p className="text-sm text-ink">Two-factor authentication is <strong>enabled</strong>.</p>
          <Button variant="secondary" size="sm" onClick={disable} disabled={pending}>
            {pending ? 'Working…' : 'Disable'}
          </Button>
        </div>
      ) : (
        <Button variant="primary" size="sm" className="mt-6" onClick={startSetup} disabled={pending}>
          {pending ? 'Working…' : 'Enable Two-Factor Authentication'}
        </Button>
      )}

      {needsStepUp && (
        <StepUpModal onGranted={handleStepUpGranted} onCancel={() => setNeedsStepUp(false)} />
      )}
    </section>
  );
}
