'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';

const COUNTRIES = ['USA', 'Canada', 'United Kingdom', 'France', 'Italy', 'Germany', 'Japan'];
const BLANK = { firstName: '', lastName: '', address: '', city: '', postalCode: '', country: 'USA' };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const { addresses: list } = await api.getAddresses();
      setAddresses(list);
    } catch {
      setAddresses([]);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const startAdd = () => {
    setForm(BLANK);
    setEditing('new');
    setError(null);
  };
  const startEdit = (a) => {
    setForm({ ...a });
    setEditing(a._id);
    setError(null);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { addresses: list } =
        editing === 'new' ? await api.addAddress(form) : await api.updateAddress(editing, form);
      setAddresses(list);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    const { addresses: list } = await api.deleteAddress(id);
    setAddresses(list);
  };

  const makeDefault = async (a) => {
    const { addresses: list } = await api.updateAddress(a._id, { ...a, isDefault: true });
    setAddresses(list);
  };

  if (addresses === null) return <div className="min-h-[30vh]" aria-hidden />;

  return (
    <section className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Addresses</h2>
        {editing === null ? (
          <Button variant="secondary" size="sm" onClick={startAdd}>
            Add Address
          </Button>
        ) : null}
      </div>

      {editing !== null ? (
        <form onSubmit={save} className="mt-6 border border-line bg-surface p-6">
          <p className="u-label mb-4 text-ink">{editing === 'new' ? 'New Address' : 'Edit Address'}</p>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={set('firstName')} required />
            <Input label="Last Name" value={form.lastName} onChange={set('lastName')} required />
            <Input label="Address" containerClassName="col-span-2" value={form.address} onChange={set('address')} required />
            <Input label="City" value={form.city} onChange={set('city')} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Postal Code" value={form.postalCode} onChange={set('postalCode')} required />
              <Select label="Country" value={form.country} onChange={set('country')}>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>
          {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}
          <div className="mt-5 flex gap-3">
            <Button type="submit" variant="primary" size="sm">Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : addresses.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">No saved addresses yet.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a._id} className="border border-line bg-surface p-5 text-sm">
              <div className="flex items-start justify-between">
                <p className="font-medium text-ink">
                  {a.firstName} {a.lastName}
                </p>
                {a.isDefault ? <span className="u-label text-accent">Default</span> : null}
              </div>
              <div className="mt-2 text-ink-soft">
                <p>{a.address}</p>
                <p>{a.city}, {a.postalCode}</p>
                <p>{a.country}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <button onClick={() => startEdit(a)} className="u-label text-muted hover:text-ink">Edit</button>
                {!a.isDefault ? (
                  <button onClick={() => makeDefault(a)} className="u-label text-muted hover:text-ink">
                    Set Default
                  </button>
                ) : null}
                <button onClick={() => remove(a._id)} className="u-label text-muted hover:text-ink">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
