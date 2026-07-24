import { stripUnsafe } from '../utils/sanitizeHtml.js';
import { logEvent } from '../services/audit.js';

const SKIP_KEYS = new Set([
  'password', 'currentpassword', 'newpassword', 'oldpassword', 'confirmpassword',
  'token', 'recoverycode', 'code', 'secret', 'otpauthurl', 'clientsecret',
  'accesstoken', 'refreshtoken', 'challenge', 'session_id', 'sessionid',
  't', // 't' = order-access capability token
]);

const MAX_DEPTH = 8;

function walk(obj, hits, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > MAX_DEPTH) return;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        const cleaned = stripUnsafe(obj[i]);
        if (cleaned !== obj[i]) { hits.push('[array]'); obj[i] = cleaned; }
      } else {
        walk(obj[i], hits, depth + 1);
      }
    }
    return;
  }
  for (const key of Object.keys(obj)) {
    if (SKIP_KEYS.has(key.toLowerCase())) continue;
    const val = obj[key];
    if (typeof val === 'string') {
      const cleaned = stripUnsafe(val);
      if (cleaned !== val) { hits.push(key); obj[key] = cleaned; }
    } else {
      walk(val, hits, depth + 1);
    }
  }
}

export function xssSanitize(req, res, next) {
  const hits = [];
  for (const container of [req.body, req.query, req.params]) {
    if (container) walk(container, hits);
  }

  if (hits.length) {
    logEvent({
      userId: req.user?._id ?? null,
      type: 'security.xss_input_sanitized',
      ip: req.ip,
      ua: req.headers['user-agent'],
      meta: { path: req.path, method: req.method, fields: [...new Set(hits)].slice(0, 10) },
    }).catch(() => {});
  }

  next();
}
