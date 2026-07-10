'use client';

import { useEffect, useState } from 'react';

function parseRemaining(endDate) {
  const diff = Math.max(0, new Date(endDate) - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, mins, secs, expired: diff === 0 };
}

export default function SaleCountdown({ endDate }) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0, expired: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(parseRemaining(endDate));
    const id = setInterval(() => setTime(parseRemaining(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!mounted) {
    return <div className="h-20" aria-hidden />;
  }

  if (time.expired) {
    return (
      <p className="text-on-dark/40 text-sm uppercase tracking-widest">Sale has ended</p>
    );
  }

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hrs' },
    { value: time.mins, label: 'Min' },
    { value: time.secs, label: 'Sec' },
  ];

  return (
    <div className="flex items-end gap-3">
      {units.map(({ value, label }, i) => (
        <div key={label} className="flex items-end gap-3">
          <div className="text-center">
            <div className="w-16 h-16 border border-on-dark/20 flex items-center justify-center bg-on-dark/5">
              <span className="font-serif text-3xl text-on-dark leading-none tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <p className="mt-1.5 text-[10px] uppercase tracking-widest text-on-dark/40">{label}</p>
          </div>
          {i < units.length - 1 && (
            <span className="text-on-dark/30 text-2xl font-light mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
