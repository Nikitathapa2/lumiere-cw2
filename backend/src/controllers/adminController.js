import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Transaction } from '../models/Transaction.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { apiPublicUrl, UPLOADS_URL_PREFIX } from '../config/paths.js';
import { logEvent } from '../services/audit.js';

const round2 = (n) => Math.round((n || 0) * 100) / 100;

// GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, totalProducts, revenueAgg, recentOrders] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Order.countDocuments(),
    Product.countDocuments({ inStock: true }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const revenue = revenueAgg[0]?.total || 0;
  res.json({ stats: { totalUsers, totalOrders, totalProducts, revenue }, recentOrders });
});

// GET /api/admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const q = req.query.q?.trim();

  const filter = {};
  if (q) {
    filter.$or = [
      { email: { $regex: q, $options: 'i' } },
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/admin/users/:id
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  res.json({ user, orders });
});

// PATCH /api/admin/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, role, newsletter } = req.body;

  const existing = await User.findById(req.params.id).select('role').lean();
  if (!existing) { res.status(404); throw new Error('User not found.'); }

  const update = {};
  if (firstName) update.firstName = firstName;
  if (lastName) update.lastName = lastName;
  if (email) update.email = email.toLowerCase();
  if (role && ['customer', 'admin'].includes(role)) update.role = role;
  if (newsletter !== undefined) update.newsletter = Boolean(newsletter);

  const user = await User.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  if (role && role !== existing.role) {
    await logEvent({
      userId: req.user._id,
      type: 'admin.role_changed',
      ip: req.ip,
      ua: req.headers['user-agent'],
      meta: { targetUserId: String(user._id), oldRole: existing.role, newRole: role, by: req.user.email },
    });
  }

  res.json({ user });
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Cannot delete admin accounts.');
  }
  await user.deleteOne();
  res.json({ message: 'User deleted.' });
});

// GET /api/admin/orders
export const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const { status, q } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (q?.trim()) {
    filter.$or = [
      { orderNumber: { $regex: q.trim(), $options: 'i' } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({ orders, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/admin/orders/:id
export const getAdminOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }
  res.json({ order });
});

const STATUS_MESSAGES = {
  processing: {
    type: 'order_processing',
    title: 'Order Being Processed',
    message: (num) => `Your order #${num} is now being processed.`,
  },
  shipped: {
    type: 'order_shipped',
    title: 'Order Shipped!',
    message: (num) => `Your order #${num} has been shipped and is on its way!`,
  },
  delivered: {
    type: 'order_delivered',
    title: 'Order Delivered',
    message: (num) => `Your order #${num} has been delivered. Enjoy!`,
  },
  cancelled: {
    type: 'order_cancelled',
    title: 'Order Cancelled',
    message: (num) => `Your order #${num} has been cancelled.`,
  },
};

// PATCH /api/admin/orders/:id
export const updateOrder = asyncHandler(async (req, res) => {
  const { status, paymentStatus } = req.body;
  const allowed = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (status && !allowed.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value.');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }

  const prevStatus = order.status;
  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  await order.save();

  if (order.userId && status && prevStatus !== status) {
    const tpl = STATUS_MESSAGES[status];
    if (tpl) {
      await Notification.create({
        userId: order.userId,
        type: tpl.type,
        title: tpl.title,
        message: tpl.message(order.orderNumber),
        orderId: order._id,
      });
    }
  }

  res.json({ order });
});

// DELETE /api/admin/orders/:id
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }
  await order.deleteOne();
  res.json({ message: 'Order deleted.' });
});

const TX_STATUSES = ['pending', 'succeeded', 'failed', 'refunded'];

// Build a Mongo filter from shared query params: status, userId, q, from, to.
function buildTransactionFilter(query) {
  const { status, userId, q, from, to } = query;
  const filter = {};

  if (status && TX_STATUSES.includes(status)) filter.status = status;
  if (userId && mongoose.isValidObjectId(userId)) filter.userId = userId;

  if (q?.trim()) {
    const rx = { $regex: q.trim(), $options: 'i' };
    filter.$or = [{ orderNumber: rx }, { customerEmail: rx }, { customerName: rx }];
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  return filter;
}

// GET /api/admin/transactions — paginated payment history with filters.
export const listTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const filter = buildTransactionFilter(req.query);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  res.json({ transactions, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/admin/transactions/:id — single payment with its order + user.
export const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('userId', 'firstName lastName email')
    .lean();
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found.');
  }
  const order = transaction.orderId ? await Order.findById(transaction.orderId).lean() : null;
  res.json({ transaction, order });
});

// GET /api/admin/wallet — revenue summary honoring the same filters.
export const getWallet = asyncHandler(async (req, res) => {
  const filter = buildTransactionFilter(req.query);

  const byStatusAgg = await Transaction.aggregate([
    { $match: filter },
    { $group: { _id: '$status', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  const byStatus = {};
  for (const s of TX_STATUSES) byStatus[s] = { amount: 0, count: 0 };
  for (const row of byStatusAgg) {
    if (byStatus[row._id]) byStatus[row._id] = { amount: round2(row.amount), count: row.count };
  }

  const revenue = byStatus.succeeded.amount;
  const refunded = byStatus.refunded.amount;
  const netRevenue = round2(revenue - refunded);
  const totalCount = byStatusAgg.reduce((n, r) => n + r.count, 0);

  const series = await Transaction.aggregate([
    { $match: { ...filter, status: 'succeeded' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        amount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    wallet: { revenue, refunded, netRevenue, totalCount, byStatus },
    series: series.map((d) => ({ date: d._id, amount: round2(d.amount), count: d.count })),
  });
});

// GET /api/admin/products — list with image status, for managing imagery.
export const listProductsAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 50);
  const q = req.query.q?.trim();

  const filter = {};
  if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { slug: { $regex: q, $options: 'i' } }];
  if (req.query.missingImage === 'true') {
    filter.$or = [{ images: { $size: 0 } }, { images: { $exists: false } }];
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ products, total, page, pages: Math.ceil(total / limit) });
});

// POST /api/admin/uploads — Multer single-image upload; returns the served URL.
// (The `uploadProductImage` middleware runs before this and populates req.file.)
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file received (field name must be "image").');
  }
  const url = `${apiPublicUrl()}${UPLOADS_URL_PREFIX}/products/${encodeURIComponent(req.file.filename)}`;
  res.status(201).json({ url, filename: req.file.filename, size: req.file.size });
});

// PATCH /api/admin/products/:id/images — set a product's images. Accepts either
// an already-hosted URL list (`images: [...]`) — e.g. external/CDN URLs — or a
// freshly uploaded file via the same Multer field, appended to the list.
export const updateProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  let images = Array.isArray(req.body.images) ? req.body.images.filter(Boolean) : null;

  if (req.file) {
    const url = `${apiPublicUrl()}${UPLOADS_URL_PREFIX}/products/${encodeURIComponent(req.file.filename)}`;
    images = [...(images ?? product.images), url];
  }

  if (!images) {
    res.status(400);
    throw new Error('Provide an `images` array or upload a file in the `image` field.');
  }

  product.images = images;
  await product.save();
  res.json({ product });
});
