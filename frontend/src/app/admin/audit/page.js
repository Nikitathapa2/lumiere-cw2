'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-300',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  LOW: 'bg-blue-100 text-blue-700 border-blue-300',
};

const TYPE_COLORS = {
  'auth.login': 'text-green-700',
  'auth.login_failed': 'text-red-600',
  'auth.register': 'text-blue-600',
  'auth.password_changed': 'text-orange-600',
  'auth.password_reset': 'text-orange-500',
  'authz.admin_denied': 'text-red-700 font-semibold',
  'admin.role_changed': 'text-purple-700 font-semibold',
  'crypto.key_rotated': 'text-yellow-700',
  'session.anomaly': 'text-red-600',
};

function VerifyBadge({ result }) {
  if (!result) return null;
  if (result.ok) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-widest border border-green-500 text-green-700 bg-green-50">
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
        Chain intact — {result.checked} entries verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-widest border border-red-500 text-red-700 bg-red-50">
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>error</span>
      Tamper detected at seq {result.brokenAt?.seq}
    </span>
  );
}

export default function AuditPage() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchLog = useCallback(async (p = 1, type = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '10' });
      if (type) params.set('type', type);
      const r = await fetch(`${API_BASE}/admin/audit?${params}`, { credentials: 'include' });
      const data = await r.json();
      setEntries(data.entries ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLog(page, typeFilter);
  }, [fetchLog, page, typeFilter]);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const r = await fetch(`${API_BASE}/admin/audit/verify`, { credentials: 'include' });
      setVerifyResult(await r.json());
    } catch {
      setVerifyResult({ ok: false, brokenAt: { reason: 'Network error' } });
    } finally {
      setVerifying(false);
    }
  };

  const handleTypeFilter = (t) => {
    setTypeFilter(t === typeFilter ? '' : t);
    setPage(1);
  };

  const QUICK_FILTERS = [
    { label: 'Login failures', value: 'auth.login_failed' },
    { label: 'Role changes', value: 'admin.role_changed' },
    { label: 'Access denied', value: 'authz.admin_denied' },
    { label: 'Key rotations', value: 'crypto.key_rotated' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Audit Trail</h1>
          <p className="mt-1 text-xs text-muted uppercase tracking-widest">
            {total.toLocaleString()} events · hash-chained · append-only
          </p>
        </div>

        <div className="flex items-center gap-3">
          <VerifyBadge result={verifyResult} />
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-widest bg-ink text-white hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {verifying ? 'Verifying…' : 'Verify Chain Integrity'}
          </button>
        </div>
      </div>

      {verifyResult && !verifyResult.ok && (
        <div className="border border-red-300 bg-red-50 p-4 text-xs text-red-800 font-mono">
          <p className="font-bold mb-1">Chain break details:</p>
          <pre>{JSON.stringify(verifyResult.brokenAt, null, 2)}</pre>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleTypeFilter(f.value)}
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-widest border transition-colors ${
              typeFilter === f.value
                ? 'bg-ink text-white border-ink'
                : 'border-line text-ink-soft hover:border-ink hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
        {typeFilter && (
          <button
            onClick={() => handleTypeFilter('')}
            className="px-3 py-1 text-xs font-semibold uppercase tracking-widest border border-line text-muted hover:border-ink hover:text-ink transition-colors"
          >
            Clear filter ×
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted">No audit entries found.</p>
      ) : (
        <div className="border border-line overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-bg border-b border-line">
              <tr>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-widest text-muted w-14">#</th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-widest text-muted">Event</th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-widest text-muted">User</th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-widest text-muted">IP</th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-widest text-muted">Time</th>
                <th className="px-4 py-3 text-left font-semibold uppercase tracking-widest text-muted">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((e) => (
                <Fragment key={e._id}>
                  <tr
                    onClick={() => setExpanded(expanded === e._id ? null : e._id)}
                    className="bg-surface hover:bg-bg cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-muted font-mono">{e.seq}</td>
                    <td className="px-4 py-3">
                      <span className={TYPE_COLORS[e.type] ?? 'text-ink'}>{e.type}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted">
                      {e.userId ? String(e.userId).slice(-6) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted">{e.ip ?? '—'}</td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted">
                      {e.hash?.slice(0, 12)}…
                    </td>
                  </tr>
                  {expanded === e._id && (
                    <tr key={`${e._id}-detail`} className="bg-bg">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="font-semibold uppercase tracking-widest text-muted mb-1">Meta</p>
                            <pre className="bg-surface border border-line p-2 overflow-auto max-h-32 text-ink">
                              {JSON.stringify(e.meta, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="font-semibold uppercase tracking-widest text-muted mb-1">Chain</p>
                            <div className="space-y-1 font-mono text-muted">
                              <p><span className="text-ink-soft">prevHash:</span> {e.prevHash?.slice(0, 24)}…</p>
                              <p><span className="text-ink-soft">hash:</span> {e.hash?.slice(0, 24)}…</p>
                              <p><span className="text-ink-soft">uaHash:</span> {e.uaHash ?? '—'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-line text-ink-soft hover:border-ink hover:text-ink disabled:opacity-40 uppercase tracking-widest"
          >
            ← Prev
          </button>
          <span className="text-muted">Page {page} of {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 border border-line text-ink-soft hover:border-ink hover:text-ink disabled:opacity-40 uppercase tracking-widest"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
