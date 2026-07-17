import { Order } from '../models/Order.js';
import { Transaction } from '../models/Transaction.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { priceOrder } from './orderController.js';
import { stripe, isStripeEnabled } from '../services/stripe.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { env } from '../config/env.js';
import { pick } from '../utils/pick.js';
import { signOrderAccess } from '../utils/orderAccess.js';

const REQUIRED_ADDRESS = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'country'];
const CURRENCY = 'usd';
const toCents = (n) => Math.round(n * 100);

// Stripe will fetch product images from public URLs only; skip localhost/http.
const publicImage = (url) => (url && /^https:\/\//i.test(url) ? [url] : undefined);

// Mass-assignment guard: only allow-listed shipping fields are copied from input.
function pickAddress(shipping) {
  return pick(shipping, REQUIRED_ADDRESS);
}

/**
 * Idempotently mark an order paid from a completed Stripe Checkout Session.
 * Safe to call multiple times (webhook + success-page verify both call this);
 * the `paymentStatus === 'paid'` short-circuit prevents duplicate side-effects.
 */
async function fulfillOrder(session) {
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null;

  const order = await Order.findOneAndUpdate(
    { stripeSessionId: session.id, paymentStatus: { $ne: 'paid' } },
    { $set: { paymentStatus: 'paid', paidAt: new Date(), status: 'placed', ...(paymentIntentId ? { paymentIntentId } : {}) } },
    { new: true }
  );

  const email = session.customer_details?.email || session.customer_email || null;
  await Transaction.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      $set: {
        status: 'succeeded',
        paidAt: new Date(),
        ...(paymentIntentId ? { paymentIntentId } : {}),
        ...(email ? { customerEmail: email } : {}),
      },
    }
  ).catch(() => {});

  if (!order) return Order.findOne({ stripeSessionId: session.id });

  if (order.userId) {
    await Notification.create({
      userId: order.userId,
      type: 'order_placed',
      title: 'Order Confirmed',
      message: `Your payment was received and order #${order.orderNumber} is confirmed.`,
      orderId: order._id,
    }).catch(() => {});
  }

  if (email) {
    sendOrderConfirmationEmail({
      to: email,
      orderNumber: order.orderNumber,
      total: order.total,
    }).catch(() => {});
  }

  return order;
}

// Mark an order failed/cancelled from an expired session or failed intent.
async function markOrderFailed({ sessionId, paymentIntentId, orderId, reason }) {
  const query = orderId
    ? { _id: orderId }
    : sessionId
    ? { stripeSessionId: sessionId }
    : paymentIntentId
    ? { paymentIntentId }
    : null;
  if (!query) return;
  const order = await Order.findOne(query);
  if (order && order.paymentStatus !== 'paid') {
    order.paymentStatus = 'failed';
    await order.save();
  }

  const txQuery = sessionId
    ? { stripeSessionId: sessionId }
    : paymentIntentId
    ? { paymentIntentId }
    : orderId
    ? { orderId }
    : null;
  if (txQuery) {
    await Transaction.findOneAndUpdate(
      { ...txQuery, status: { $ne: 'succeeded' } },
      { $set: { status: 'failed', ...(reason ? { failureReason: reason } : {}) } }
    ).catch(() => {});
  }
}

/**
 * POST /api/checkout/session
 * Prices the bag server-side, creates a pending Order, and opens a Stripe
 * Checkout Session. Returns the hosted-checkout URL to redirect to.
 * Falls back to an immediate mock fulfillment when Stripe is not configured.
 */
export const createCheckoutSession = asyncHandler(async (req, res) => {
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

  if (!isStripeEnabled && !env.allowMockCheckout) {
    res.status(503);
    throw new Error(
      'Payments are not configured. Set STRIPE_SECRET_KEY to enable checkout (or ALLOW_MOCK_CHECKOUT=true for UI-only testing).'
    );
  }

  const priced = await priceOrder(items, promoCode);
  const customerName = `${shipping.firstName} ${shipping.lastName}`.trim();

  const order = await Order.create({
    ...priced,
    userId: req.user?._id || null,
    shippingAddress: pickAddress(shipping),
    paymentStatus: 'pending',
    status: 'placed',
  });

  if (!isStripeEnabled) {
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.paymentIntentId = `mock_pi_${Date.now().toString(36)}`;
    order.paymentProvider = 'mock';
    await order.save();
    await Transaction.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      customerEmail: req.user?.email || null,
      customerName,
      amount: order.total,
      currency: order.currency,
      status: 'succeeded',
      provider: 'mock',
      paymentIntentId: order.paymentIntentId,
      paidAt: order.paidAt,
    }).catch(() => {});
    if (order.userId) {
      await Notification.create({
        userId: order.userId,
        type: 'order_placed',
        title: 'Order Confirmed',
        message: `Order #${order.orderNumber} is confirmed (test mode).`,
        orderId: order._id,
      }).catch(() => {});
    }
    if (req.user?.email) {
      sendOrderConfirmationEmail({
        to: req.user.email,
        orderNumber: order.orderNumber,
        total: order.total,
      }).catch(() => {});
    }
    // Guest mock orders need a capability token for the confirmation page (anti-IDOR).
    const accessToken = order.userId ? null : signOrderAccess(order._id);
    return res.status(201).json({ mock: true, orderId: order._id, accessToken, url: null });
  }

  // ── Real Stripe Checkout Session ──
  const line_items = priced.items.map((it) => ({
    quantity: it.qty,
    price_data: {
      currency: CURRENCY,
      unit_amount: toCents(it.price),
      product_data: {
        name: it.name,
        ...(it.size ? { description: `Size ${it.size}` } : {}),
        ...(publicImage(it.image) ? { images: publicImage(it.image) } : {}),
      },
    },
  }));

  if (priced.tax > 0) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: CURRENCY,
        unit_amount: toCents(priced.tax),
        product_data: { name: 'Estimated Tax' },
      },
    });
  }

  let discounts;
  if (priced.discount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: toCents(priced.discount),
      currency: CURRENCY,
      duration: 'once',
      name: priced.promoCode || 'Discount',
    });
    discounts = [{ coupon: coupon.id }];
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    ...(discounts ? { discounts } : {}),
    client_reference_id: String(order._id),
    metadata: { orderId: String(order._id), orderNumber: order.orderNumber },
    payment_intent_data: { metadata: { orderId: String(order._id) } },
    ...(req.user?.email ? { customer_email: req.user.email } : {}),
    success_url: `${env.clientUrl}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientUrl}/checkout?canceled=1`,
  });

  order.stripeSessionId = session.id;
  await order.save();

  await Transaction.create({
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    customerEmail: req.user?.email || null,
    customerName,
    amount: order.total,
    currency: order.currency,
    status: 'pending',
    provider: 'stripe',
    stripeSessionId: session.id,
  }).catch(() => {});

  res.status(201).json({ url: session.url, orderId: order._id });
});

/**
 * GET /api/checkout/verify?session_id=...
 * Called by the confirmation page after the Stripe redirect. Retrieves the
 * session and — if paid — fulfills the order idempotently. This is the safety
 * net that lets local dev work without webhook forwarding.
 */
export const verifyCheckout = asyncHandler(async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) {
    res.status(400);
    throw new Error('Missing session_id.');
  }
  if (!isStripeEnabled) {
    res.status(400);
    throw new Error('Stripe is not configured.');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    const order = await fulfillOrder(session);
    if (!order) {
      res.status(404);
      throw new Error('Order not found for this session.');
    }
    return res.json({ order, paid: true });
  }

  const order = await Order.findOne({ stripeSessionId: sessionId }).lean();
  res.json({ order, paid: false });
});

/**
 * POST /api/webhooks/stripe  (raw body — mounted before express.json in app.js)
 * Verifies the Stripe signature and reacts to payment lifecycle events.
 */
export const stripeWebhookHandler = async (req, res) => {
  if (!isStripeEnabled) return res.status(503).send('Stripe not configured');

  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await fulfillOrder(event.data.object);
        break;

      case 'checkout.session.expired':
        await markOrderFailed({ sessionId: event.data.object.id, reason: 'Checkout session expired' });
        break;

      case 'checkout.session.async_payment_failed':
        await markOrderFailed({ sessionId: event.data.object.id, reason: 'Async payment failed' });
        break;

      case 'payment_intent.payment_failed':
        await markOrderFailed({
          paymentIntentId: event.data.object.id,
          orderId: event.data.object.metadata?.orderId,
          reason: event.data.object.last_payment_error?.message || 'Payment failed',
        });
        break;

      default:
        break;
    }
  } catch (err) {
    return res.status(500).send(`Webhook handler error: ${err.message}`);
  }

  res.json({ received: true });
};
