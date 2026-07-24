import { logEvent } from '../services/audit.js';

const POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_DEPTH = 8;

function scrub(obj, hits, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > MAX_DEPTH) return obj;
  if (Array.isArray(obj)) {
    for (const item of obj) scrub(item, hits, depth + 1);
    return obj;
  }
  // Own keys only — never touch inherited ones.
  for (const key of Object.keys(obj)) {
    if (POLLUTION_KEYS.has(key)) {
      hits.push(key);
      delete obj[key];
      continue;
    }
    scrub(obj[key], hits, depth + 1);
  }
  return obj;
}

export function prototypePollutionGuard(req, res, next) {
  const hits = [];
  for (const container of [req.body, req.params, req.query]) {
    if (container) scrub(container, hits);
  }

  if (hits.length) {
    logEvent({
      userId: req.user?._id ?? null,
      type: 'security.prototype_pollution_blocked',
      ip: req.ip,
      ua: req.headers['user-agent'],
      meta: { path: req.path, method: req.method, keys: [...new Set(hits)].slice(0, 10) },
    }).catch(() => {});
  }

  next();
}
