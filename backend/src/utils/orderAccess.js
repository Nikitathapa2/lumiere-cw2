import crypto from 'crypto';
import { env } from '../config/env.js';


const SECRET = env.orderAccessSecret;

export function signOrderAccess(orderId) {
  return crypto.createHmac('sha256', SECRET).update(String(orderId)).digest('base64url');
}

export function verifyOrderAccess(orderId, token) {
  if (!token || typeof token !== 'string') return false;
  const expected = signOrderAccess(orderId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
