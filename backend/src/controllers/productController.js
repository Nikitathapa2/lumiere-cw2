import { Product } from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  name: { name: 1 },
};

// GET /api/products
// Query: category, size, color (hex or name), q, sort, page, limit
export const getProducts = asyncHandler(async (req, res) => {
  const { category, size, color, q, tag, sort = 'newest', onSale } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));

  const filter = {};
  if (category && category !== 'all') filter.category = category;
  if (size) filter.sizes = size;
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    const min = parseInt(req.query.minPrice, 10);
    const max = parseInt(req.query.maxPrice, 10);
    if (!isNaN(min)) filter.price.$gte = min;
    if (!isNaN(max)) filter.price.$lte = max;
  }
  if (tag) filter.collectionTags = tag;
  if (onSale === 'true') filter.originalPrice = { $ne: null, $gt: 0 };
  if (req.query.slugs) {
    const list = String(req.query.slugs).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    filter.slug = { $in: list };
  }
  if (color) {
    filter.$or = [{ 'colors.hex': color }, { 'colors.name': new RegExp(`^${color}$`, 'i') }];
  }
  if (q) filter.$text = { $search: q };

  const sortBy = SORTS[sort] || SORTS.newest;

  const [items, total, categoryFacets] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
    Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);

  const facets = categoryFacets.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});

  res.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    facets,
  });
});

// GET /api/products/new-arrivals
export const getNewArrivals = asyncHandler(async (req, res) => {
  const limit = Math.min(12, Math.max(1, parseInt(req.query.limit, 10) || 4));
  const items = await Product.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ items });
});

// GET /api/products/:slug
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug.toLowerCase() }).lean();
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // "Style With" suggestions: explicit tags first, else same-category fallback (§3.3).
  const styleTags = (product.collectionTags || []).filter((t) => t.startsWith('style-with:'));
  const relatedSlugs = styleTags.map((t) => t.split(':')[1]);

  let related = [];
  if (relatedSlugs.length) {
    related = await Product.find({ slug: { $in: relatedSlugs } }).lean();
  }
  if (related.length < 4) {
    const fill = await Product.find({
      category: product.category,
      slug: { $ne: product.slug },
    })
      .limit(4 - related.length)
      .lean();
    related = [...related, ...fill];
  }

  res.json({ product, related: related.slice(0, 4) });
});
