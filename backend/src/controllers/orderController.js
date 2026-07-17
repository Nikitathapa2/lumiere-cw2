import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Promo } from '../models/Promo.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createPaymentIntent } from '../services/payment.js';
import { pick } from '../utils/pick.js';
import { signOrderAccess, verifyOrderAccess } from '../utils/orderAccess.js';
import { logEvent } from '../services/audit.js';

const SHIPPING_FIELDS = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country'];

export const TAX_RATE = 0.08;
const round2 = (n) => Math.round(n * 100) / 100;

const REQUIRED_ADDRESS = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country'];

// Compute authoritative money from DB prices — never trust client-sent totals.
// Exported so the Stripe checkout controller reuses the exact same pricing.
export async function priceOrder(rawItems, promoCode) {
  const slugs = [...new Set(rawItems.map((i) => i.slug))];
  const products = await Product.find({ slug: { $in: slugs } }).lean();
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const items = rawItems.map((raw) => {
    const product = bySlug.get(raw.slug);
    if (!product) {
      const err = new Error(`Product not available: ${raw.slug}`);
      err.statusCode = 400;
      throw err;
    }
    const qty = Math.max(1, parseInt(raw.qty, 10) || 1);
    return {
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: raw.size || null,
      color: raw.color || null,
      qty,
      image: product.images?.[0] || null,
    };
  });

  const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.qty, 0));

  let discount = 0;
  let appliedCode = null;
  if (promoCode) {
    const promo = await Promo.findOne({ code: String(promoCode).toUpperCase() });
    if (promo && promo.isValid()) {
      appliedCode = promo.code;
      if (promo.type === 'percent') discount = round2((subtotal * promo.value) / 100);
      else if (promo.type === 'fixed') discount = Math.min(promo.value, subtotal);
    }
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = round2(taxable * TAX_RATE);
  const shipping = 0;
  const total = round2(taxable + tax + shipping);

  return { items, subtotal, discount, promoCode: appliedCode, tax, shipping, total };
}

// POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shipping, promoCode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Your bag is empty.');
  }

  const missing = REQUIRED_ADDRESS.filter((f) => !shipping?.[f]?.toString().trim());
  if (missing.length) {
    res.status(400);
    throw new Error(`Missing shipping fields: ${missing.join(', ')}`);
  }

  const priced = await priceOrder(items, promoCode);

  const intent = await createPaymentIntent({
    amount: priced.total,
    metadata: { items: priced.items.length },
  });

  const order = await Order.create({
    ...priced,
    // userId is bound server-side to the authenticated principal — never from the body.
    userId: req.user?._id || null,
    // Mass-assignment guard: only allow-listed shipping fields are copied from input.
    shippingAddress: pick(shipping, SHIPPING_FIELDS),
    paymentIntentId: intent.id,
    paymentStatus: 'pending',
    status: 'placed',
  });

  // Guest orders (no userId) get a capability token so the confirmation page can
  // display the just-placed order without exposing an IDOR.
  const accessToken = order.userId ? null : signOrderAccess(order._id);

  res.status(201).json({
    order,
    accessToken,
    payment: { clientSecret: intent.clientSecret, mock: intent.mock },
  });
});

// GET /api/orders  (protected) — current user's order history, newest first.
export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ orders });
});

// GET /api/orders/:id  (by Mongo _id or orderNumber)
// Object-level authorization (anti-IDOR): binding every read to the caller.
export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { orderNumber: id };
  const order = await Order.findOne(query).lean();
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isAdmin = req.user?.role === 'admin';
  const isOwner = order.userId && req.user && String(order.userId) === String(req.user._id);
  const token = req.query.t || req.get('x-order-token');
  const hasValidToken = !order.userId && verifyOrderAccess(order._id, token);

  if (!isAdmin && !isOwner && !hasValidToken) {
    await logEvent({
      userId: req.user?._id ?? null,
      type: 'authz.order_denied',
      ip: req.ip,
      ua: req.headers['user-agent'],
      meta: { orderId: String(order._id), ownedByAccount: Boolean(order.userId) },
    });
    res.status(403);
    throw new Error('You are not authorized to view this order.');
  }

  res.json({ order });
});
