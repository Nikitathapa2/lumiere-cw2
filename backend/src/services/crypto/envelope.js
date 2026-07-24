import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;


function aesgcmEncrypt(plainBuf, key) {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plainBuf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ct, iv, tag };
}

function aesgcmDecrypt(ct, key, iv, tag) {
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}


export function encryptEnvelope(plaintext, kek, keyVersion) {
  const dek = crypto.randomBytes(32);

  const { ct, iv, tag } = aesgcmEncrypt(Buffer.from(plaintext, 'utf8'), dek);
  const { ct: wDek, iv: wIv, tag: wTag } = aesgcmEncrypt(dek, kek);

  return {
    ct: ct.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    wDek: wDek.toString('base64'),
    wIv: wIv.toString('base64'),
    wTag: wTag.toString('base64'),
    kv: keyVersion,
  };
}


export function decryptEnvelope(blob, kek) {
  const dek = aesgcmDecrypt(
    Buffer.from(blob.wDek, 'base64'),
    kek,
    Buffer.from(blob.wIv, 'base64'),
    Buffer.from(blob.wTag, 'base64')
  );
  const plain = aesgcmDecrypt(
    Buffer.from(blob.ct, 'base64'),
    dek,
    Buffer.from(blob.iv, 'base64'),
    Buffer.from(blob.tag, 'base64')
  );
  return plain.toString('utf8');
}


export function rewrapEnvelope(blob, oldKek, newKek, newKeyVersion) {
  const dek = aesgcmDecrypt(
    Buffer.from(blob.wDek, 'base64'),
    oldKek,
    Buffer.from(blob.wIv, 'base64'),
    Buffer.from(blob.wTag, 'base64')
  );

  const { ct: wDek, iv: wIv, tag: wTag } = aesgcmEncrypt(dek, newKek);

  return {
    ...blob,
    wDek: wDek.toString('base64'),
    wIv: wIv.toString('base64'),
    wTag: wTag.toString('base64'),
    kv: newKeyVersion,
  };
}


export function reencryptEnvelope(blob, oldKek, newKek, newKeyVersion) {
  const plaintext = decryptEnvelope(blob, oldKek);
  return encryptEnvelope(plaintext, newKek, newKeyVersion);
}
