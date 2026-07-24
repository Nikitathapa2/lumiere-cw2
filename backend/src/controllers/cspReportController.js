import { logEvent } from '../services/audit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// POST /api/csp-report
// Receives Content-Security-Policy violation reports from browsers.
// The browser sends: Content-Type: application/csp-report (Level 2)
//                or: Content-Type: application/reports+json (Reporting API v1)
// We normalise both formats and store via the Batch 23 audit log.
//
// This endpoint is public (no auth) — browsers fire it automatically, and the
// initiating page may be unauthenticated. Rate-limited at the route level.
export const cspReport = asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body) return res.sendStatus(204);

  let report;
  if (body['csp-report']) {
    report = body['csp-report'];
  } else if (Array.isArray(body) && body.length > 0) {
    report = body[0]?.body ?? body[0];
  } else {
    report = body;
  }

  const violated = report['violated-directive'] ?? report.violatedDirective ?? '';
  const blocked = report['blocked-uri'] ?? report.blockedURL ?? '';
  const doc = report['document-uri'] ?? report.documentURL ?? '';
  const line = report['line-number'] ?? report.lineNumber ?? null;
  const col = report['column-number'] ?? report.columnNumber ?? null;
  const sample = report['script-sample'] ?? report.sample ?? '';

  await logEvent({
    type: 'csp.violation',
    ip: req.ip,
    ua: req.headers['user-agent'],
    meta: {
      violated,
      blocked,
      doc,
      line,
      col,
      sample: sample ? String(sample).slice(0, 200) : undefined,
    },
  });

  res.sendStatus(204);
});
