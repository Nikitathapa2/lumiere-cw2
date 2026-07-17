import { Promo } from '../models/Promo.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// POST /api/cart/promo  { code }
// Validates a promo code and returns its discount descriptor for the client to apply.
export const applyPromo = asyncHandler(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) {
    res.status(400);
    throw new Error('Please enter a code.');
  }

  const promo = await Promo.findOne({ code });
  if (!promo || !promo.isValid()) {
    res.status(404);
    throw new Error('That code is invalid or has expired.');
  }

  res.json({ code: promo.code, type: promo.type, value: promo.value });
});
