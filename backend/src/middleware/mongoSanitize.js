import { logEvent } from '../services/audit.js';

const FORBIDDEN_KEY = /^\$|\./;
const MAX_DEPTH = 8;

function sanitize(obj, hits, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > MAX_DEPTH) return obj;
  if (Array.isArray(obj)) return obj.map((v) => sanitize(v, hits, depth + 1));

  for (const key of Object.keys(obj)) {
    if (FORBIDDEN_KEY.test(key)) {
      hits.push(key);
      delete obj[key];
    } else {
      obj[key] = sanitize(obj[key], hits, depth + 1);
    }
  }
  return obj;
}

export function mongoSanitize(req, res, next) {
  const hits = [];
  for (const container of [req.body, req.params, req.query]) {
    if (container) sanitize(container, hits);
  }

  if (hits.length) {
    logEvent({
      userId: req.user?._id ?? null,
      type: 'security.nosql_injection_blocked',
      ip: req.ip,
      ua: req.headers['user-agent'],
      meta: { path: req.path, method: req.method, strippedKeys: hits.slice(0, 10) },
    }).catch(() => {});
  }

  next();
}
