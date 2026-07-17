import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Session } from '../models/Session.js';
import { computeFingerprint } from './fingerprint.js';

const COOKIE_NAME = 'lumiere_token';

export function signToken(userId, jti) {
  return jwt.sign({ id: userId, jti }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export async function setAuthCookie(res, userId, req) {
  const jti = crypto.randomUUID();
  const { deviceHash, uaHash, ipPrefix } = computeFingerprint(req);
  const userAgent = (req.headers['user-agent'] || '').slice(0, 256);

  await Session.create({ userId, jti, deviceHash, uaHash, ipPrefix, userAgent });

  const token = signToken(userId, jti);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    maxAge: 15 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  return token;
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export { COOKIE_NAME };
