'use client';

import { Input, Select } from '@/components/ui/Field';

const COUNTRIES = ['Nepal', 'USA', 'Canada', 'United Kingdom', 'France', 'Italy', 'Germany', 'Japan'];

export default function ShippingForm({ values, onChange, errors = {} }) {
  const field = (name) => ({
    value: values[name] || '',
    onChange: (e) => onChange(name, e.target.value),
    'aria-invalid': errors[name] ? 'true' : undefined,
  });

  return (
    <section>
      <h2 className="border-b border-line pb-3 font-serif text-2xl">Shipping Address</h2>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input label="First Name" placeholder="Julianne" {...field('firstName')} />
        <Input label="Last Name" placeholder="Vanderbilt" {...field('lastName')} />
        <Input
          label="Address"
          placeholder="Durbar Marg, Kathmandu"
          containerClassName="md:col-span-2"
          {...field('address')}
        />
        <Input label="City" placeholder="Kathmandu" {...field('city')} />
        <div className="grid grid-cols-2 gap-5">
          <Input label="Postal Code" placeholder="44600" {...field('postalCode')} />
          <Select label="Country" {...field('country')}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </section>
  );
}
