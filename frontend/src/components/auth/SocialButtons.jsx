'use client';

import { api } from '@/lib/api';


function SocialButton({ label, disabled, onClick }) {
  return (
    <button
      type="button"
      title={disabled ? 'Coming soon' : undefined}
      disabled={disabled}
      onClick={onClick}
      className="border border-line bg-surface py-3 text-center text-xs uppercase tracking-wide text-ink-soft transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line"
    >
      {label}
    </button>
  );
}

export default function SocialButtons({ label = 'Or continue with' }) {
  return (
    <div>
      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="u-label text-muted">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SocialButton label="Google" onClick={() => { window.location.href = api.googleOAuthUrl(); }} />
        <SocialButton label="Apple" disabled />
      </div>
    </div>
  );
}
