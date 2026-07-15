import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// GET /api/auth/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  res.json({ slugs: req.user.wishlist });
});

// POST /api/auth/wishlist  { slug }
export const addToWishlist = asyncHandler(async (req, res) => {
  const slug = String(req.body.slug || '').trim().toLowerCase();
  if (!slug) {
    res.status(400);
    throw new Error('A product slug is required.');
  }
  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: slug } });
  const user = await User.findById(req.user._id).lean();
  res.json({ slugs: user.wishlist });
});

// DELETE /api/auth/wishlist/:slug
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const slug = String(req.params.slug || '').toLowerCase();
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: slug } });
  const user = await User.findById(req.user._id).lean();
  res.json({ slugs: user.wishlist });
});

// POST /api/auth/wishlist/merge  { slugs: [] }  — fold a guest list into the account on login.
export const mergeWishlist = asyncHandler(async (req, res) => {
  const incoming = Array.isArray(req.body.slugs)
    ? req.body.slugs.map((s) => String(s).toLowerCase()).filter(Boolean)
    : [];
  if (incoming.length) {
    await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: { $each: incoming } } });
  }
  const user = await User.findById(req.user._id).lean();
  res.json({ slugs: user.wishlist });
});
