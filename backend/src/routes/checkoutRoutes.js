import { Router } from 'express';
import { createCheckoutSession, verifyCheckout } from '../controllers/checkoutController.js';
import { attachUser } from '../middleware/auth.js';

const router = Router();

router.post('/session', attachUser, createCheckoutSession);
router.get('/verify', verifyCheckout);

export default router;
