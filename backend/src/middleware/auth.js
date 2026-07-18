import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { verifyToken, clearAuthCookie, COOKIE_NAME } from '../utils/token.js';
import { computeFingerprint } from '../utils/fingerprint.js';
import { logEvent } from '../services/audit.js';
import { asyncHandler } from './asyncHandler.js';

// Require a valid, context-bound session. Reads the JWT from the httpOnly cookie
// (or Bearer header), validates it, then checks the Session row for revocation and
// device/UA fingerprint consistency (Zero-Trust, Batch 20).
export const protect = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[COOKIE_NAME] || bearer;

  if (!token) {
    res.status(401);
    throw new Error('Not authenticated.');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    res.status(401);
    throw new Error('Session expired. Please sign in again.');
  }

  const { id, jti } = decoded;

  const user = await User.findById(id);
  if (!user) {
    res.status(401);
    throw new Error('Account no longer exists.');
  }

  if (jti) {
    const session = await Session.findOne({ jti });

    if (!session || session.revokedAt) {
      clearAuthCookie(res);
      res.status(401);
      throw new Error('Session has been revoked. Please sign in again.');
    }

    const { deviceHash, uaHash } = computeFingerprint(req);
    if (session.deviceHash !== deviceHash || session.uaHash !== uaHash) {
      await logEvent({
        userId: id,
        type: 'session.anomaly',
        ip: req.ip,
        ua: req.headers['user-agent'],
        meta: {
          jti,
          reason: 'fingerprint_mismatch',
          stored: { dh: session.deviceHash, uh: session.uaHash },
          received: { dh: deviceHash, uh: uaHash },
        },
      });
      await Session.updateOne({ _id: session._id }, { revokedAt: new Date() });
      clearAuthCookie(res);
      res.status(401);
      throw new Error('Session context mismatch detected. Please sign in again.');
    }

    await Session.updateOne({ _id: session._id }, { lastSeenAt: new Date() });
    req.session = session;
  }

  req.user = user;
  next();
});

// Soft auth: attach req.user if a valid session exists, but never block the request.
// Used on guest-capable routes (e.g. order creation) so logged-in orders get a userId.
export const attachUser = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[COOKIE_NAME] || bearer;
  if (token) {
    try {
      const { id } = verifyToken(token);
      req.user = await User.findById(id);
    } catch {
      req.user = null;
    }
  }
  next();
});
