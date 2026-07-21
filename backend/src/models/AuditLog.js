import crypto from 'crypto';
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const GENESIS_HASH = '0'.repeat(64);

const auditLogSchema = new Schema(
  {
    seq: { type: Number, required: true, unique: true, index: true },
    type: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    ip: { type: String, default: null },
    uaHash: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
    prevHash: { type: String, required: true },
    hash: { type: String, required: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    // Mongoose strips empty objects (e.g. meta: {}) from documents before save
    // by default ("minimize"). That desyncs the stored doc from the hash, which
    // was computed in-memory against the un-minimized value — every entry with
    // an empty meta would fail chain verification. Keep meta exactly as hashed.
    minimize: false,
  }
);

// ── Hash computation ──────────────────────────────────────────────────────────
// canonical(entry) produces a deterministic string from all auditable fields.
// Key order is fixed (not insertion-order) so the hash is identical across runtimes.
export function canonicalEntry(seq, type, userId, ip, uaHash, meta, prevHash) {
  const obj = {
    ip: ip ?? null,
    meta,
    prevHash,
    seq,
    type,
    uaHash: uaHash ?? null,
    userId: userId ? String(userId) : null,
  };
  return JSON.stringify(obj);
}

export function computeHash(seq, type, userId, ip, uaHash, meta, prevHash) {
  const payload = canonicalEntry(seq, type, userId, ip, uaHash, meta, prevHash);
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ── UA hashing ────────────────────────────────────────────────────────────────
export function hashUA(ua) {
  if (!ua) return null;
  return crypto.createHash('sha256').update(String(ua).slice(0, 512)).digest('hex').slice(0, 16);
}

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
