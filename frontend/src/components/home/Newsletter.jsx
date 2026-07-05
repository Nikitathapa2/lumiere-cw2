'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email) setDone(true);
  };

  return (
    <section className="py-section-desktop px-margin-mobile">
      <div className="max-w-4xl mx-auto text-center">
        <span className="font-label-lg text-label-lg tracking-[0.2em] uppercase mb-4 block">
          Stay Updated
        </span>
        <h2 className="font-headline-lg text-headline-lg mb-8">Join the LUMIÈRE Circle</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-2xl mx-auto">
          Receive early access to new collections, exclusive seasonal offers, and editorial insights
          delivered to your inbox.
        </p>

        {done ? (
          <p className="font-label-lg text-label-lg uppercase tracking-widest text-secondary">
            Thank you for subscribing.
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-grow px-6 py-4 bg-white border border-outline-variant focus:border-primary focus:ring-0 font-body-md outline-none transition-colors"
            />
            <button
              type="submit"
              className="bg-primary text-on-primary px-10 py-4 font-label-lg text-label-lg uppercase tracking-widest transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
