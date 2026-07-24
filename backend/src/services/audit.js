import { AuditLog, GENESIS_HASH, computeHash, hashUA } from '../models/AuditLog.js';

const REDACT_KEYS = new Set([
  'password', 'passwordhash', 'newpassword', 'currentpassword', 'oldpassword',
  'token', 'resetpasswordtoken', 'accesstoken', 'refreshtoken', 'authorization',
  'cookie', 'cvv', 'cvc', 'cardnumber', 'pan', 'secret', 'masterkey', 'dek',
]);

function redact(value, depth = 0) {
  if (depth > 5 || value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [
      k,
      REDACT_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : redact(v, depth + 1),
    ])
  );
}

let insertQueue = Promise.resolve();

function enqueue(fn) {
  const next = insertQueue.then(fn).catch((err) => {
    console.error('[audit] chain insert error:', err.message);
  });
  insertQueue = next.then(() => {}, () => {});
  return next;
}

async function insertEntry({ userId, type, ip, ua, meta }) {
  const safeMeta = redact(meta ?? {});
  const uaHash = hashUA(ua);

  const last = await AuditLog.findOne().sort({ seq: -1 }).select('seq hash').lean();
  const seq = (last?.seq ?? 0) + 1;
  const prevHash = last?.hash ?? GENESIS_HASH;

  const hash = computeHash(seq, type, userId ?? null, ip ?? null, uaHash, safeMeta, prevHash);

  await AuditLog.create({
    seq,
    type,
    userId: userId ?? null,
    ip: ip ?? null,
    uaHash,
    meta: safeMeta,
    prevHash,
    hash,
  });

  return { seq, type, userId, ip, meta: safeMeta };
}

export async function logEvent({ userId = null, type, ip = null, ua = null, meta = {} }) {
  let inserted;
  try {
    inserted = await enqueue(() => insertEntry({ userId, type, ip, ua, meta }));
  } catch (err) {
    console.error('[audit] logEvent failed:', err.message);
    return;
  }

  if (inserted) {
    setImmediate(async () => {
      try {
        const { runAlertRules } = await import('./alerting.js');
        await runAlertRules(inserted);
      } catch {}
    });
  }
}
