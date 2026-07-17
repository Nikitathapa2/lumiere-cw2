import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { logEvent } from '../services/audit.js';
import { clearAuthCookie } from '../utils/token.js';

// GET /api/account/sessions — list all active (non-revoked) sessions for the current user.
export const listSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id, revokedAt: null })
    .sort({ lastSeenAt: -1 })
    .lean();

  const currentJti = req.session?.jti ?? null;

  const result = sessions.map((s) => ({
    id: s._id,
    jti: s.jti,
    userAgent: s.userAgent || 'Unknown device',
    ipPrefix: s.ipPrefix,
    createdAt: s.createdAt,
    lastSeenAt: s.lastSeenAt,
    current: s.jti === currentJti,
  }));

  res.json({ sessions: result });
});

// DELETE /api/account/sessions/:id — revoke a single session by its _id.
export const revokeSession = asyncHandler(async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) {
    res.status(404);
    throw new Error('Session not found.');
  }

  if (session.revokedAt) {
    return res.json({ message: 'Session already revoked.' });
  }

  await Session.updateOne({ _id: session._id }, { revokedAt: new Date() });

  if (req.session?.jti === session.jti) {
    clearAuthCookie(res);
  }

  await logEvent({
    userId: req.user._id,
    type: 'session.revoked',
    ip: req.ip,
    ua: req.headers['user-agent'],
    meta: { revokedJti: session.jti },
  });

  res.json({ message: 'Session revoked.' });
});

// DELETE /api/account/sessions — revoke all sessions ("sign out everywhere").
export const revokeAllSessions = asyncHandler(async (req, res) => {
  await Session.updateMany(
    { userId: req.user._id, revokedAt: null },
    { revokedAt: new Date() }
  );

  clearAuthCookie(res);

  await logEvent({
    userId: req.user._id,
    type: 'session.revoke_all',
    ip: req.ip,
    ua: req.headers['user-agent'],
  });

  res.json({ message: 'All sessions revoked. You have been signed out.' });
});

// POST /api/account/sessions/step-up — verify the user's password and grant step-up
// on the current session. The step-up timestamp is checked by requireStepUp() middleware
// on sensitive routes (change-password, admin).
export const stepUp = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error('Password required.');
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.comparePassword(password))) {
    await logEvent({
      userId: req.user._id,
      type: 'step_up.failed',
      ip: req.ip,
      ua: req.headers['user-agent'],
    });
    res.status(401);
    throw new Error('Incorrect password.');
  }

  const now = new Date();
  if (req.session) {
    await Session.updateOne({ _id: req.session._id }, { stepUpAt: now });
  }

  await logEvent({
    userId: req.user._id,
    type: 'step_up.granted',
    ip: req.ip,
    ua: req.headers['user-agent'],
  });

  res.json({ message: 'Step-up granted.', stepUpAt: now.toISOString() });
});
