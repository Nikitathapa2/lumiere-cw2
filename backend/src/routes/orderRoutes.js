import { Router } from 'express';
import { createOrder, getOrder, listMyOrders } from '../controllers/orderController.js';
import { protect, attachUser } from '../middleware/auth.js';

const router = Router();

router.post('/', attachUser, createOrder);
router.get('/', protect, listMyOrders);
// Soft-auth so getOrder can enforce object-level authorization: an account order
// requires ownership/admin; a guest order requires a valid capability token.
router.get('/:id', attachUser, getOrder);

export default router;
