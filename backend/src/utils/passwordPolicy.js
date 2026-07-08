import { createRequire } from 'module';
import bcrypt from 'bcryptjs';
import { checkBreach } from '../services/breachCheck.js';

const require = createRequire(import.meta.url);
const zxcvbn = require('zxcvbn');

const MIN_LENGTH = 8;
const MIN_SCORE = 3;

/**
 * Enforce password policy: minimum length, zxcvbn strength, and breach check.
 *
 * @throws Error with a user-facing message if the password fails any check.
 * @returns {{ score: number, feedback: object }} zxcvbn result (for forwarding to UI).
 */
export async function enforcePasswordPolicy(password) {
  if (typeof password !== 'string' || password.length < MIN_LENGTH) {
    throw Object.assign(new Error(`Password must be at least ${MIN_LENGTH} characters.`), { status: 400 });
  }

  const result = zxcvbn(password);
  if (result.score < MIN_SCORE) {
    const suggestions = result.feedback.suggestions?.join(' ') || '';
    const warning = result.feedback.warning || 'Password is too weak.';
    const detail = suggestions ? `${warning} ${suggestions}` : warning;
    throw Object.assign(
      new Error(`Password is too weak — please choose a stronger one. ${detail}`.trim()),
      { status: 400 }
    );
  }

  const { breached, source } = await checkBreach(password);
  if (breached) {
    throw Object.assign(
      new Error(
        'This password has appeared in a known data breach. Please choose a different password.'
      ),
      { status: 400, breachSource: source }
    );
  }

  return { score: result.score, feedback: result.feedback };
}

/**
 * Check a plaintext password against a user's stored password history.
 * Throws if the password matches any of the last N hashes.
 *
 * @param {string} plain - candidate plaintext password
 * @param {{ hash: string }[]} history - passwordHistory entries from User document
 */
export async function enforcePasswordHistory(plain, history = []) {
  for (const entry of history) {
    if (await bcrypt.compare(plain, entry.hash)) {
      throw Object.assign(
        new Error('You have used this password recently. Please choose a new one.'),
        { status: 400 }
      );
    }
  }
}


export function rotatePasswordHistory(user) {
  const MAX_HISTORY = 5;
  if (!user.passwordHash) return;
  if (!Array.isArray(user.passwordHistory)) user.passwordHistory = [];
  user.passwordHistory.unshift({ hash: user.passwordHash, changedAt: new Date() });
  user.passwordHistory = user.passwordHistory.slice(0, MAX_HISTORY);
}
