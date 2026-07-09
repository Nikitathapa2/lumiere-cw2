import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { setAuthCookie } from '../utils/token.js';
import { issueCsrfToken } from '../middleware/csrf.js';
import { env } from '../config/env.js';
import { logEvent } from '../services/audit.js';
import {
  generateSecret,
  buildOtpAuthUrl,
  verifyToken,
  encryptSecret,
  decryptSecret,
  generateRecoveryCodes,
} from '../utils/totp.js';

const MFA_CHALLENGE_TTL_MS = 5 * 60 * 1000;

export function issueMfaChallenge(userId) {
  const payload = Buffer.from(JSON.stringify({ u: String(userId), t: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', env.jwtSecret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyMfaChallenge(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', env.jwtSecret).update(payload).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { u, t } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() - t > MFA_CHALLENGE_TTL_MS) return null;
    return u;
  } catch {
    return null;
  }
}

// POST /api/auth/mfa/setup (protected + step-up) — generate a secret and QR payload.
// The secret is stored encrypted but MFA stays disabled until /enable confirms a code.
export const setupMfa = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+mfaSecret');
  if (user.mfaEnabled) {
    res.status(409);
    throw new Error('MFA is already enabled on this account.');
  }

  const secret = generateSecret();
  user.mfaSecret = encryptSecret(secret);
  await user.save();

  await logEvent({ userId: user._id, type: 'mfa.setup_started', ip: req.ip, ua: req.headers['user-agent'] });

  res.json({
    secret,
    otpauthUrl: buildOtpAuthUrl(secret, user.email),
  });
});

// POST /api/auth/mfa/enable (protected + step-up) — confirm a code, activate MFA,
// and return one-time recovery codes.
export const enableMfa = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id).select('+mfaSecret +mfaRecoveryCodes');

  if (!user.mfaSecret) {
    res.status(400);
    throw new Error('Start MFA setup first.');
  }
  if (!verifyToken(decryptSecret(user.mfaSecret), token)) {
    res.status(400);
    throw new Error('That code is invalid or expired. Try again.');
  }

  const recoveryCodes = generateRecoveryCodes(8);
  user.mfaRecoveryCodes = await Promise.all(recoveryCodes.map((c) => bcrypt.hash(c, 10)));
  user.mfaEnabled = true;
  await user.save();

  await logEvent({ userId: user._id, type: 'mfa.enabled', ip: req.ip, ua: req.headers['user-agent'] });

  res.json({
    message: 'Multi-factor authentication enabled.',
    recoveryCodes,
  });
});

// POST /api/auth/mfa/disable (protected + step-up) — turn MFA off.
export const disableMfa = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+mfaSecret +mfaRecoveryCodes');
  user.mfaEnabled = false;
  user.mfaSecret = null;
  user.mfaRecoveryCodes = [];
  await user.save();

  await logEvent({ userId: user._id, type: 'mfa.disabled', ip: req.ip, ua: req.headers['user-agent'] });
  res.json({ message: 'Multi-factor authentication disabled.' });
});

// POST /api/auth/mfa/verify — second login step. Accepts the challenge token plus
// either a 6-digit TOTP code or a recovery code, then issues the real session.
export const verifyMfa = asyncHandler(async (req, res) => {
  const { challenge, token, recoveryCode } = req.body;
  const userId = verifyMfaChallenge(challenge);
  if (!userId) {
    res.status(401);
    throw new Error('Your verification session expired. Please sign in again.');
  }

  const user = await User.findById(userId).select('+mfaSecret +mfaRecoveryCodes');
  if (!user || !user.mfaEnabled) {
    res.status(401);
    throw new Error('Invalid verification request.');
  }

  let ok = false;
  if (token) {
    ok = verifyToken(decryptSecret(user.mfaSecret), token);
  } else if (recoveryCode) {
    for (let i = 0; i < user.mfaRecoveryCodes.length; i++) {
      if (await bcrypt.compare(recoveryCode.trim(), user.mfaRecoveryCodes[i])) {
        user.mfaRecoveryCodes.splice(i, 1);
        await user.save();
        ok = true;
        break;
      }
    }
  }

  if (!ok) {
    await logEvent({ userId: user._id, type: 'mfa.verify_failed', ip: req.ip, ua: req.headers['user-agent'] });
    res.status(401);
    throw new Error('Invalid authentication code.');
  }

  await logEvent({ userId: user._id, type: 'mfa.verify_success', ip: req.ip, ua: req.headers['user-agent'] });

  await setAuthCookie(res, user._id, req);
  issueCsrfToken(res);
  res.json({ user });
});
