//  Mass-assignment protection 
const ALWAYS_FORBIDDEN = new Set([
  '_id', 'id', '__v', '__proto__', 'constructor', 'prototype',
  'role', 'isAdmin', 'admin', 'passwordHash', 'password_hash',
  'mfaEnabled', 'mfaSecret', 'mfaRecoveryCodes',
  'resetPasswordToken', 'resetPasswordExpires',
  'passwordHistory', 'lockedUntil', 'authProvider', 'googleId',
  'createdAt', 'updatedAt',
]);

export function pick(source, allowed = []) {
  const out = Object.create(null);
  if (!source || typeof source !== 'object') return out;

  for (const key of allowed) {
    if (ALWAYS_FORBIDDEN.has(key)) continue;
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      out[key] = source[key];
    }
  }
  return out;
}

export function detectForbidden(source) {
  if (!source || typeof source !== 'object') return [];
  return Object.keys(source).filter((k) => ALWAYS_FORBIDDEN.has(k));
}

export { ALWAYS_FORBIDDEN };
