
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { getActiveKek, getActiveKeyVersion, getKekForVersion } from '../services/crypto/keyManager.js';
import { rewrapEnvelope, reencryptEnvelope } from '../services/crypto/envelope.js';
import { logEvent } from '../services/audit.js';

const ENCRYPTED_FIELDS = ['_addressesEnc'];
const COLLECTION = 'users';

async function connect() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lumiere');
  console.log('[rotateKeys] connected to MongoDB');
}

async function rotate(mode) {
  const newKek = getActiveKek();
  const newKv = getActiveKeyVersion();

  const collection = mongoose.connection.collection(COLLECTION);
  const cursor = collection.find({});

  let total = 0;
  let rotated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    total++;
    let changed = false;
    const update = {};

    for (const field of ENCRYPTED_FIELDS) {
      const blob = doc[field];
      if (!blob || !blob.ct) { skipped++; continue; }

      if (blob.kv === newKv) { skipped++; continue; }

      try {
        const oldKek = getKekForVersion(blob.kv);
        const newBlob =
          mode === 'reencrypt'
            ? reencryptEnvelope(blob, oldKek, newKek, newKv)
            : rewrapEnvelope(blob, oldKek, newKek, newKv);

        update[field] = newBlob;
        changed = true;
      } catch (err) {
        console.error(`[rotateKeys] doc ${doc._id} field ${field} failed:`, err.message);
      }
    }

    if (changed) {
      await collection.updateOne({ _id: doc._id }, { $set: update });
      rotated++;
    }
  }

  console.log(`[rotateKeys] done. total=${total} rotated=${rotated} skipped=${skipped}`);

  try {
    await logEvent({
      type: 'crypto.key_rotated',
      meta: { mode, newKeyVersion: newKv, rotated, total },
    });
  } catch {}
}

async function main() {
  const mode = process.argv.includes('--reencrypt') ? 'reencrypt' : 'rewrap';
  console.log(`[rotateKeys] mode=${mode}  newKeyVersion=${getActiveKeyVersion()}`);

  await connect();
  await rotate(mode);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[rotateKeys] fatal:', err.message);
  process.exit(1);
});
