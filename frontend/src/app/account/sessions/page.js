'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function parseUA(ua) {
  if (!ua || ua === 'Unknown device') return { browser: 'Unknown browser', os: 'Unknown OS' };
  const browser =
    /Edg\//.test(ua) ? 'Microsoft Edge'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Browser';
  const os =
    /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : 'Unknown OS';
  return { browser, os };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [signOutAll, setSignOutAll] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const data = await api.getSessions();
      setSessions(data.sessions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setBusy(true);
    try {
      await api.revokeSession(revokeTarget.id);
      setRevokeTarget(null);
      await loadSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRevokeAll = async () => {
    setBusy(true);
    try {
      await api.revokeAllSessions();
      setSignOutAll(false);
      window.location.href = '/login';
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (loading) return <div className="min-h-[20vh]" />;

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Active Sessions</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Devices currently signed in to your account.
          </p>
        </div>
        <Button
          variant="secondary"
          className="shrink-0 text-xs"
          onClick={() => setSignOutAll(true)}
          disabled={busy}
        >
          Sign Out Everywhere
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      <ul className="mt-6 divide-y divide-line border border-line">
        {sessions.length === 0 && (
          <li className="px-5 py-6 text-sm text-muted">No active sessions found.</li>
        )}
        {sessions.map((s) => {
          const { browser, os } = parseUA(s.userAgent);
          return (
            <li key={s.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {browser} on {os}
                  {s.current && (
                    <span className="ml-2 rounded-sm bg-ink px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-surface">
                      This device
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  IP prefix: {s.ipPrefix || '—'} &nbsp;·&nbsp; Last active: {formatDate(s.lastSeenAt)}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Signed in: {formatDate(s.createdAt)}
                </p>
              </div>
              {!s.current && (
                <button
                  type="button"
                  onClick={() => setRevokeTarget(s)}
                  className="shrink-0 text-xs font-semibold uppercase tracking-widest text-muted underline underline-offset-2 hover:text-ink"
                >
                  Sign out
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {revokeTarget && (
        <ConfirmModal
          title="Sign out this device?"
          message={`This will immediately revoke access for ${parseUA(revokeTarget.userAgent).browser} on ${parseUA(revokeTarget.userAgent).os}.`}
          confirmLabel="Sign Out"
          cancelLabel="Cancel"
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}

      {signOutAll && (
        <ConfirmModal
          title="Sign out everywhere?"
          message="This will end all active sessions, including this one. You will be taken to the login page."
          confirmLabel="Sign Out Everywhere"
          cancelLabel="Cancel"
          onConfirm={handleRevokeAll}
          onCancel={() => setSignOutAll(false)}
        />
      )}
    </section>
  );
}
