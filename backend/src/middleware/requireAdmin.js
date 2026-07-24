import { logEvent } from '../services/audit.js';

// Must be used after `protect` (which sets req.user).
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    // Log authorization denial (IDOR / privilege escalation attempt)
    logEvent({
      userId: req.user?._id ?? null,
      type: 'authz.admin_denied',
      ip: req.ip,
      ua: req.headers['user-agent'],
      meta: { path: req.path, method: req.method },
    }).catch(() => {});

    res.status(403);
    const err = new Error('Access denied. Admin privileges required.');
    return next(err);
  }
  next();
};
