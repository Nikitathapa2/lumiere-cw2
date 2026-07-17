import crypto from 'crypto';

function h16(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}

export function computeFingerprint(req) {
  const ua = req.headers['user-agent'] || '';
  const lang = req.headers['accept-language'] || '';
  const clientFp = req.headers['x-device-fingerprint'] || '';

  const deviceHash = h16(`${ua}|${lang}|${clientFp}`);
  const uaHash = h16(ua);

  const raw = req.ip || req.socket?.remoteAddress || '';
  let ipPrefix = '';
  if (raw.includes(':') && !raw.startsWith('::ffff:')) {
    ipPrefix = raw.split(':').slice(0, 3).join(':');
  } else {
    const v4 = raw.replace(/^::ffff:/, '');
    ipPrefix = v4.split('.').slice(0, 2).join('.');
  }

  return { deviceHash, uaHash, ipPrefix };
}
