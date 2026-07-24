import crypto from 'crypto';
import { encryptEnvelope, decryptEnvelope } from '../services/crypto/envelope.js';
import { getActiveKek, getActiveKeyVersion, getKekForVersion } from '../services/crypto/keyManager.js';


export function computeBlindIndex(value) {
  const key = process.env.BLIND_INDEX_KEY || process.env.MASTER_KEY || 'dev-blind-index-key-000000000000';
  return crypto
    .createHmac('sha256', key)
    .update(String(value).toLowerCase())
    .digest('hex')
    .slice(0, 32);
}


function encryptBlob(value) {
  const kek = getActiveKek();
  const kv = getActiveKeyVersion();
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  return encryptEnvelope(json, kek, kv);
}

function decryptBlob(blob) {
  const kek = getKekForVersion(blob.kv);
  const json = decryptEnvelope(blob, kek);
  try {
    return JSON.parse(json);
  } catch {
    return json;
  }
}


export function fieldEncryptionPlugin(schema, options = {}) {
  const fields = (options.fields ?? []).map((f) => (typeof f === 'string' ? { name: f } : f));

  for (const { name } of fields) {
    const encKey = `_${name}Enc`;
    const memKey = `__${name}`;

    schema.add({ [encKey]: { type: schema.constructor.Types?.Mixed ?? Object, default: null } });

    schema
      .virtual(name)
      .get(function () {
        return this[memKey];
      })
      .set(function (val) {
        this[memKey] = val;
        this._encryptionDirty = true;
      });

    schema.post('init', function () {
      const blob = this[encKey];
      if (blob && blob.ct) {
        try {
          this[memKey] = decryptBlob(blob);
        } catch (err) {
          console.error(`[fieldEncryption] failed to decrypt ${name}:`, err.message);
          this[memKey] = undefined;
        }
      } else {
        this[memKey] = undefined;
      }
    });

    schema.pre('save', function (next) {
      const val = this[memKey];
      if (val !== undefined) {
        this[encKey] = encryptBlob(val);
        this.markModified(encKey);
      }
      next();
    });
  }
}
