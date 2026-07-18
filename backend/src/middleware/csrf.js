import crypto from 'crypto';
import { env } from '../config/env.js';
import { logEvent } from '../services/audit.js';

const CSRF_COOKIE = 'lumiere_csrf';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function issueCsrfToken(res) {
  const raw = crypto.randomBytes(24).toString('base64url');
  const sig = crypto.createHmac('sha256', env.csrfSecret).update(raw).digest('base64url');
  const token = `${raw}.${sig}`;
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: env.cookieSecure,
    sameSite: 'lax',
    maxAge: 15 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  return token;
}

function isValid(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [raw, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', env.csrfSecret).update(raw).digest('base64url');
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export function requireCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get(CSRF_HEADER);

  if (!cookieToken || !headerToken || cookieToken !== headerToken || !isValid(headerToken)) {
    logEvent({
      userId: req.user?._id ?? null,
      type: 'security.csrf_blocked',
      ip: req.ip,
      ua: req.headers['user-agent'],
      meta: { path: req.path, method: req.method, hadCookie: Boolean(cookieToken), hadHeader: Boolean(headerToken) },
    }).catch(() => {});
    res.status(403);
    return next(new Error('CSRF validation failed. Please refresh and try again.'));
  }

  next();
}

export { CSRF_COOKIE, CSRF_HEADER };
