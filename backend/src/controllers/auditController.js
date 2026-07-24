import { AuditLog, GENESIS_HASH, computeHash } from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const PAGE_LIMIT = 10;

// GET /api/admin/audit
// Paginated audit log — most recent first. Supports ?type= and ?userId= filters.
export const listAuditLog = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, parseInt(req.query.limit) || PAGE_LIMIT);
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.userId) filter.userId = req.query.userId;

  const [entries, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ seq: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  res.json({ entries, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/admin/audit/verify
// Walks the entire chain from genesis, recomputes each hash, returns the first
// broken link. O(n) full scan — not for hot paths; use only from admin UI.
export const verifyChain = asyncHandler(async (req, res) => {
  const cursor = AuditLog.find().sort({ seq: 1 }).lean().cursor();

  let expectedPrev = GENESIS_HASH;
  let prevSeq = 0;
  let checked = 0;

  for await (const entry of cursor) {
    if (entry.seq !== prevSeq + 1) {
      return res.json({
        ok: false,
        brokenAt: {
          seq: entry.seq,
          reason: `Sequence gap: expected ${prevSeq + 1}, got ${entry.seq}`,
        },
        checked,
      });
    }

    const expected = computeHash(
      entry.seq,
      entry.type,
      entry.userId,
      entry.ip,
      entry.uaHash,
      entry.meta,
      entry.prevHash
    );

    if (entry.hash !== expected) {
      return res.json({
        ok: false,
        brokenAt: {
          seq: entry.seq,
          stored: entry.hash,
          expected,
          reason: 'Hash mismatch — entry was tampered with after insertion',
        },
        checked,
      });
    }

    if (entry.prevHash !== expectedPrev) {
      return res.json({
        ok: false,
        brokenAt: {
          seq: entry.seq,
          storedPrevHash: entry.prevHash,
          expectedPrevHash: expectedPrev,
          reason: 'prevHash chain break — a row was deleted or reordered',
        },
        checked,
      });
    }

    expectedPrev = entry.hash;
    prevSeq = entry.seq;
    checked++;
  }

  res.json({ ok: true, checked, tip: expectedPrev });
});
