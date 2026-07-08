import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { Collection } from '../models/Collection.js';
import { Category } from '../models/Category.js';
import { Promo } from '../models/Promo.js';
import { User } from '../models/User.js';
import { products } from './products.js';
import { collections } from './collections.js';
import { promos } from './promos.js';
import { copyLocalAssets } from './seedImages.js';

// Wipes and reseeds the catalog. Run with: npm run seed
async function seed() {
  await connectDB();

  console.log('Copying local image assets into backend/uploads…');
  const assetStats = copyLocalAssets();
  console.log(
    `  ✓ ${assetStats.totalProductImages} product images ready (${assetStats.products} copied), ${assetStats.site} site assets copied.`
  );

  console.log('Clearing existing catalog…');
  await Promise.all([
    Product.deleteMany({}),
    Collection.deleteMany({}),
    Promo.deleteMany({}),
    Category.deleteMany({}),
  ]);

  console.log(`Inserting ${products.length} products…`);
  await Product.insertMany(products);

  console.log(`Inserting ${collections.length} collections…`);
  await Collection.insertMany(collections);

  try {
    const { categories } = await import('./categories.js');
    console.log(`Inserting ${categories.length} categories…`);
    await Category.insertMany(categories);
  } catch (err) {
    console.warn('No categories seed found or failed to load:', err.message);
  }

  console.log(`Inserting ${promos.length} promo codes…`);
  await Promo.insertMany(promos);

  const known = new Set(products.map((p) => p.slug));
  for (const col of collections) {
    const missing = (col.productSlugs || []).filter((s) => !known.has(s));
    if (missing.length) console.warn(`  ⚠ collection "${col.slug}" references missing: ${missing.join(', ')}`);
  }

  const adminEmail = 'admin@lumiere.store';
  let admin = await User.findOne({ email: adminEmail }).select('+passwordHash');
  if (!admin) {
    admin = new User({
      firstName: 'Admin',
      lastName: 'LUMIÈRE',
      email: adminEmail,
      role: 'admin',
      newsletter: false,
    });
  }
  await admin.setPassword('Admin@12345');
  admin.role = 'admin';
  await admin.save();
  console.log(`✓ Admin user: ${adminEmail} / Admin@12345`);

  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  console.log('✓ Seed complete. Category counts:');
  counts.sort((a, b) => a._id.localeCompare(b._id)).forEach((c) => console.log(`   ${c._id}: ${c.count}`));

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
