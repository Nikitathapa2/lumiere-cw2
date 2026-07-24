
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { encryptEnvelope } from '../services/crypto/envelope.js';
import { getActiveKek, getActiveKeyVersion } from '../services/crypto/keyManager.js';
import { logEvent } from '../services/audit.js';

const DRY_RUN = process.argv.includes('--dry-run');

async function connect() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lumiere');
  console.log('[migrateEncryption] connected to MongoDB');
}

async function migrate() {
  const kek = getActiveKek();
  const kv = getActiveKeyVersion();
  const collection = mongoose.connection.collection('users');

  const cursor = collection.find({
    'addresses.0': { $exists: true },
    _addressesEnc: { $exists: false },
  });

  let migrated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    const addresses = doc.addresses;
    if (!Array.isArray(addresses) || addresses.length === 0) { skipped++; continue; }

    // Preserve existing _id values from the old subdocuments
    const normalized = addresses.map((a) => ({
      _id: a._id?.toString() ?? new mongoose.Types.ObjectId().toHexString(),
      firstName: a.firstName ?? '',
      lastName: a.lastName ?? '',
      address: a.address ?? '',
      city: a.city ?? '',
      postalCode: a.postalCode ?? '',
      country: a.country ?? '',
      isDefault: a.isDefault ?? false,
    }));

    const blob = encryptEnvelope(JSON.stringify(normalized), kek, kv);

    if (DRY_RUN) {
      console.log(`[dry-run] would migrate ${doc._id} (${addresses.length} address(es))`);
    } else {
      await collection.updateOne(
        { _id: doc._id },
        {
          $set: { _addressesEnc: blob },
          $unset: { addresses: '' },
        }
      );
      migrated++;
    }
  }

  if (!DRY_RUN) {
    console.log(`[migrateEncryption] migrated=${migrated} skipped=${skipped}`);
    await logEvent({
      type: 'crypto.migration_completed',
      meta: { migrated, skipped, keyVersion: kv },
    });
  } else {
    console.log(`[migrateEncryption] dry-run complete — no changes written`);
  }
}

async function main() {
  if (DRY_RUN) console.log('[migrateEncryption] DRY RUN — no data will be modified');
  await connect();
  await migrate();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[migrateEncryption] fatal:', err.message);
  process.exit(1);
});
