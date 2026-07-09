import crypto from 'crypto';
import { env } from '../config/env.js';

const STATE_TTL_MS = 10 * 60 * 1000;

export function issueOAuthState() {
  const payload = Buffer.from(
    JSON.stringify({ n: crypto.randomBytes(16).toString('hex'), t: Date.now() })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', env.oauthStateSecret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyOAuthState(state) {
  if (!state || typeof state !== 'string' || !state.includes('.')) return false;
  const [payload, sig] = state.split('.');
  const expected = crypto.createHmac('sha256', env.oauthStateSecret).update(payload).digest('base64url');
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const { t } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Date.now() - t < STATE_TTL_MS;
  } catch {
    return false;
  }
}

export function buildGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: env.googleCallbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function fetchGoogleProfile(code) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: env.googleCallbackUrl,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) throw new Error(`Google token exchange failed (HTTP ${tokenRes.status})`);
  const { access_token } = await tokenRes.json();

  const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) throw new Error(`Google userinfo failed (HTTP ${profileRes.status})`);
  const p = await profileRes.json();

  return {
    googleId: p.sub,
    email: (p.email || '').toLowerCase(),
    emailVerified: Boolean(p.email_verified),
    firstName: p.given_name || 'Google',
    lastName: p.family_name || 'User',
  };
}
