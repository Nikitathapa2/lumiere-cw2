import crypto from 'crypto';
import { LoginAttempt } from '../models/LoginAttempt.js';
import { User } from '../models/User.js';
import { logEvent } from './audit.js';

const ACCOUNT_LOCK_THRESHOLD = 10;
const ACCOUNT_LOCK_MS = 15 * 60 * 1000;
const IP_MULTI_ACCOUNT_THRESHOLD = 5;

function hashEmail(email) {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
}

export async function checkAccountLock(email) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+lockedUntil');
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
    const err = new Error(
      `Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`
    );
    err.status = 423;
    err.lockedUntil = user.lockedUntil.toISOString();
    throw err;
  }
}


export async function recordFailedAttempt(email, ip) {
  const accountHash = hashEmail(email);

  await LoginAttempt.create({ accountHash, ip });

  const recentForAccount = await LoginAttempt.countDocuments({ accountHash });
  if (recentForAccount >= ACCOUNT_LOCK_THRESHOLD) {
    const lockedUntil = new Date(Date.now() + ACCOUNT_LOCK_MS);
    await User.updateOne({ email: email.toLowerCase() }, { lockedUntil });

    await logEvent({
      type: 'auth.account_locked',
      ip,
      ua: null,
      meta: { email: `${email[0]}***@${email.split('@')[1]}`, recentForAccount },
    });
  }

  const distinctAccounts = await LoginAttempt.distinct('accountHash', { ip });
  if (distinctAccounts.length >= IP_MULTI_ACCOUNT_THRESHOLD) {
    await logEvent({
      type: 'auth.stuffing_suspected',
      ip,
      ua: null,
      meta: { distinctAccounts: distinctAccounts.length },
    });
  }
}


export async function clearAccountLock(email) {
  await User.updateOne(
    { email: email.toLowerCase() },
    { $unset: { lockedUntil: '' } }
  );
}
