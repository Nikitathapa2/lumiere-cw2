import { Router } from 'express';
import productRoutes from './productRoutes.js';
import collectionRoutes from './collectionRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import { issueCsrfToken } from '../middleware/csrf.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'lumiere-api', time: new Date().toISOString() });
});

// CSRF bootstrap — SPA calls this on load to obtain a signed token it can echo
// back in the X-CSRF-Token header on subsequent state-changing requests.
router.get('/csrf-token', (req, res) => {
  const token = issueCsrfToken(res);
  res.json({ csrfToken: token });
});

router.use('/products', productRoutes);
router.use('/collections', collectionRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/account/sessions', sessionRoutes);

export default router;
