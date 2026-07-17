import crypto from 'crypto';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { env } from '../config/env.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { enforcePasswordPolicy, enforcePasswordHistory, rotatePasswordHistory } from '../utils/passwordPolicy.js';
import { checkAccountLock, recordFailedAttempt, clearAccountLock } from '../services/stuffingGuard.js';
import { logEvent } from '../services/audit.js';
import { issueCsrfToken } from '../middleware/csrf.js';
import { issueMfaChallenge } from './mfaController.js';
import { issueOAuthState, verifyOAuthState, buildGoogleAuthUrl, fetchGoogleProfile } from '../utils/oauth.js';
import { pick } from '../utils/pick.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  // Mass-assignment guard: never build the user from raw body — a client could
  // otherwise smuggle role:'admin'. Only these fields are ever accepted.
  const { firstName, lastName, email, password, newsletter } = pick(req.body, [
    'firstName', 'lastName', 'email', 'password', 'newsletter',
  ]);

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields.');
  }
  // Type-coercion guard (NoSQL): email must be a plain string, not an operator object.
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address.');
  }

  await enforcePasswordPolicy(password);

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  const user = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    newsletter: Boolean(newsletter),
  });
  await user.setPassword(password);
  await user.save();

  await logEvent({ userId: user._id, type: 'auth.register', ip: req.ip, ua: req.headers['user-agent'] });

  await setAuthCookie(res, user._id, req);
  issueCsrfToken(res);
  res.status(201).json({ user });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Type-coercion guard (NoSQL): reject non-string credentials outright so a
  // payload like { email: { $ne: null } } can never reach the query.
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    res.status(400);
    throw new Error('Please enter your email and password.');
  }

  try {
    await checkAccountLock(email);
  } catch (lockErr) {
    res.status(lockErr.status || 423);
    throw lockErr;
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  const passwordOk = user && user.passwordHash && (await user.comparePassword(password));

  if (!passwordOk) {
    await recordFailedAttempt(email, req.ip || '');
    await logEvent({ userId: user?._id ?? null, type: 'auth.login_failed', ip: req.ip, ua: req.headers['user-agent'] });
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  await clearAccountLock(email);

  if (user.mfaEnabled) {
    await logEvent({ userId: user._id, type: 'mfa.challenge_issued', ip: req.ip, ua: req.headers['user-agent'] });
    return res.json({ mfaRequired: true, challenge: issueMfaChallenge(user._id) });
  }

  await logEvent({ userId: user._id, type: 'auth.login', ip: req.ip, ua: req.headers['user-agent'] });

  await setAuthCookie(res, user._id, req);
  issueCsrfToken(res);
  res.json({ user });
});

// GET /api/auth/oauth/google — begin the Authorization Code flow.
export const googleStart = asyncHandler(async (req, res) => {
  if (!env.googleOAuthEnabled) {
    res.status(503);
    throw new Error('Google sign-in is not configured on this server.');
  }
  const state = issueOAuthState();
  res.cookie('lumiere_oauth_state', state, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
    path: '/',
  });
  res.redirect(buildGoogleAuthUrl(state));
});

// GET /api/auth/oauth/google/callback — exchange code, find-or-link-or-create user.
export const googleCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  const cookieState = req.cookies?.lumiere_oauth_state;

  if (!code || !verifyOAuthState(state) || state !== cookieState) {
    await logEvent({ type: 'auth.oauth_failed', ip: req.ip, ua: req.headers['user-agent'], meta: { reason: 'bad_state' } });
    return res.redirect(`${env.clientUrl}/login?error=oauth_state`);
  }
  res.clearCookie('lumiere_oauth_state', { path: '/' });

  let profile;
  try {
    profile = await fetchGoogleProfile(code);
  } catch (err) {
    await logEvent({ type: 'auth.oauth_failed', ip: req.ip, ua: req.headers['user-agent'], meta: { reason: err.message } });
    return res.redirect(`${env.clientUrl}/login?error=oauth_exchange`);
  }

  let user = await User.findOne({ googleId: profile.googleId });
  if (!user && profile.email) {
    user = await User.findOne({ email: profile.email });
    if (user) {
      user.googleId = profile.googleId;
      await user.save();
    }
  }
  if (!user) {
    user = await User.create({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      authProvider: 'google',
      googleId: profile.googleId,
    });
  }

  await logEvent({ userId: user._id, type: 'auth.oauth_login', ip: req.ip, ua: req.headers['user-agent'], meta: { provider: 'google' } });

  await setAuthCookie(res, user._id, req);
  issueCsrfToken(res);
  res.redirect(`${env.clientUrl}/account?sso=google`);
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Signed out.' });
});

// GET /api/auth/me  (protected)
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
// Always responds success (no account enumeration). In dev, returns the token for testing.
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const generic = { message: 'If an account exists, a reset link has been sent.' };

  if (!email || !EMAIL_RE.test(email)) return res.json(generic);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.json(generic);

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(rawToken);
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail({ to: user.email, resetUrl });
  } catch (emailErr) {
    console.error('[auth] failed to send reset email:', emailErr.message);
  }

  res.json(env.isProd ? generic : { ...generic, devToken: rawToken, devResetUrl: resetUrl });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400);
    throw new Error('Invalid reset request.');
  }

  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires +passwordHash +passwordHistory');

  if (!user) {
    res.status(400);
    throw new Error('This reset link is invalid or has expired.');
  }

  await enforcePasswordPolicy(password);
  await enforcePasswordHistory(password, user.passwordHistory);

  rotatePasswordHistory(user);
  await user.setPassword(password);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  await logEvent({ userId: user._id, type: 'auth.password_reset', ip: req.ip, ua: req.headers['user-agent'] });

  await setAuthCookie(res, user._id, req);
  issueCsrfToken(res);
  res.json({ user, message: 'Password updated.' });
});
