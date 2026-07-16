'use client';

import { useState, useEffect, useCallback } from 'react';
import { csrfHeader, ensureCsrfToken } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const ROLE_BADGE = {
  admin: 'bg-ink text-white',
  customer: 'bg-line text-muted',
};

function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    newsletter: user.newsletter,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/admin/users/${user._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeader() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      onSave(data.user);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-surface border border-line p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Edit User</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted">First Name</span>
              <input value={form.firstName} onChange={set('firstName')} className="mt-1 w-full border border-line px-3 py-2 text-sm" required />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-muted">Last Name</span>
              <input value={form.lastName} onChange={set('lastName')} className="mt-1 w-full border border-line px-3 py-2 text-sm" required />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted">Email</span>
            <input type="email" value={form.email} onChange={set('email')} className="mt-1 w-full border border-line px-3 py-2 text-sm" required />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted">Role</span>
            <select value={form.role} onChange={set('role')} className="mt-1 w-full border border-line px-3 py-2 text-sm bg-surface">
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-ink text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-ink/90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border border-line px-4 py-2 text-xs uppercase tracking-widest text-ink-soft hover:text-ink">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('q', search);
      const res = await fetch(`${API_BASE}/admin/users?${params}`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q);
  };

  const handleDelete = async (id) => {
    try {
      await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE', credentials: 'include', headers: { ...csrfHeader() } });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        setTotal((t) => t - 1);
      }
    } catch {}
    setDeleteConfirm(null);
  };

  const handleSave = (updated) => {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 border border-line px-3 py-2 text-sm min-w-0"
          />
          <button type="submit" className="bg-ink text-white px-4 py-2 text-xs uppercase tracking-widest">
            Search
          </button>
        </form>
        <span className="text-xs text-muted">{total} users</span>
      </div>

      <div className="bg-surface border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg">
              {['Name', 'Email', 'Role', 'Newsletter', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">Loading…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">No users found.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u._id} className="border-b border-line last:border-0 hover:bg-bg transition-colors">
                <td className="px-4 py-3 text-xs font-medium text-ink">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-xs text-ink-soft">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-sm ${ROLE_BADGE[u.role] || 'bg-line text-muted'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{u.newsletter ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditing(u)}
                      className="text-[10px] uppercase tracking-widest text-ink-soft hover:text-ink"
                    >
                      Edit
                    </button>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => setDeleteConfirm(u._id)}
                        className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs border border-line disabled:opacity-40 hover:bg-bg">
            ←
          </button>
          <span className="text-xs text-muted">Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs border border-line disabled:opacity-40 hover:bg-bg">
            →
          </button>
        </div>
      )}

      {editing && <EditModal user={editing} onClose={() => setEditing(null)} onSave={handleSave} />}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm bg-surface border border-line p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest">Delete User?</h2>
            <p className="text-sm text-ink-soft">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 text-white px-4 py-2 text-xs uppercase tracking-widest">
                Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-line px-4 py-2 text-xs uppercase tracking-widest">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
