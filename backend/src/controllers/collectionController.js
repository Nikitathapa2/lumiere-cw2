import { Collection } from '../models/Collection.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// GET /api/collections  (?featured=true for the homepage card row)
export const getCollections = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.featured === 'true') filter.featured = true;
  const items = await Collection.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ items });
});

// GET /api/collections/:slug  — collection meta + its products
export const getCollectionBySlug = asyncHandler(async (req, res) => {
  const collection = await Collection.findOne({ slug: req.params.slug.toLowerCase() }).lean();
  if (!collection) {
    res.status(404);
    throw new Error('Collection not found');
  }

  const products = await Product.find({ slug: { $in: collection.productSlugs || [] } }).lean();
  res.json({ collection, products });
});
