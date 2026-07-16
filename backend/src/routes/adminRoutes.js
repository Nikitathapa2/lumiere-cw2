import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireStepUp } from '../middleware/stepUp.js';
import { uploadProductImage } from '../middleware/upload.js';
import {
  getStats,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  listOrders,
  getAdminOrder,
  updateOrder,
  deleteOrder,
  listTransactions,
  getTransaction,
  getWallet,
  listProductsAdmin,
  uploadImage,
  updateProductImages,
} from '../controllers/adminController.js';
import auditRoutes from './auditRoutes.js';

const router = Router();

router.use(protect, requireStepUp(15), requireAdmin);

router.get('/stats', getStats);

router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/orders', listOrders);
router.get('/orders/:id', getAdminOrder);
router.patch('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);

router.get('/wallet', getWallet);
router.get('/transactions', listTransactions);
router.get('/transactions/:id', getTransaction);

router.get('/products', listProductsAdmin);
router.post('/uploads', uploadProductImage, uploadImage);
router.patch('/products/:id/images', uploadProductImage, updateProductImages);

router.use('/audit', auditRoutes);

export default router;
