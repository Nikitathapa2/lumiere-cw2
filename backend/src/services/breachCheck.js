import crypto from 'crypto';
import { BloomFilter } from '../utils/bloom.js';
import { COMMON_PASSWORDS } from '../data/commonPasswords.js';

const offlineFilter = new BloomFilter(100_000, 0.001);

for (const pw of COMMON_PASSWORDS) {
  const sha1 = crypto.createHash('sha1').update(pw).digest('hex').toUpperCase();
  offlineFilter.add(sha1);
}

async function hibpCheck(sha1UpperCase) {
  const prefix = sha1UpperCase.slice(0, 5);
  const suffix = sha1UpperCase.slice(5);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true', 'User-Agent': 'LUMIERE-store/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HIBP returned HTTP ${res.status}`);

    const body = await res.text();
    for (const line of body.split('\r\n')) {
      const [lineSuffix] = line.split(':');
      if (lineSuffix === suffix) return true;
    }
    return false;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError' || err.name === 'TypeError') {
      console.warn('[breach] HIBP API unreachable, using offline filter:', err.message);
      return null;
    }
    throw err;
  }
}

/**
 * Check whether a plaintext password has appeared in known data breaches.
 *
 * @returns {Promise<{ breached: boolean, source: 'hibp'|'offline'|'clean' }>}
 */
export async function checkBreach(plainPassword) {
  const sha1 = crypto.createHash('sha1').update(plainPassword).digest('hex').toUpperCase();

  if (offlineFilter.mightContain(sha1)) {
    return { breached: true, source: 'offline' };
  }

  try {
    const found = await hibpCheck(sha1);
    if (found === null) {
      return { breached: false, source: 'offline' };
    }
    return { breached: found, source: found ? 'hibp' : 'clean' };
  } catch (err) {
    console.error('[breach] unexpected error:', err.message);
    return { breached: false, source: 'offline' };
  }
}
