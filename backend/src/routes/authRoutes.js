import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  googleStart,
  googleCallback,
} from '../controllers/authController.js';
import {
  setupMfa,
  enableMfa,
  disableMfa,
  verifyMfa,
} from '../controllers/mfaController.js';
import {
  updateProfile,
  changePassword,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/accountController.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  mergeWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';
import { requireStepUp } from '../middleware/stepUp.js';
import { authLimiter, mfaVerifyLimiter, passwordResetLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

router.post('/mfa/verify', mfaVerifyLimiter, verifyMfa);
router.post('/mfa/setup', protect, requireStepUp(15), setupMfa);
router.post('/mfa/enable', protect, requireStepUp(15), enableMfa);
router.post('/mfa/disable', protect, requireStepUp(15), disableMfa);

router.get('/oauth/google', googleStart);
router.get('/oauth/google/callback', googleCallback);

router.get('/me', protect, me);
router.patch('/me', protect, updateProfile);
router.post('/change-password', protect, requireStepUp(15), changePassword);
router.get('/addresses', protect, listAddresses);
router.post('/addresses', protect, addAddress);
router.patch('/addresses/:addrId', protect, updateAddress);
router.delete('/addresses/:addrId', protect, deleteAddress);

router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.post('/wishlist/merge', protect, mergeWishlist);
router.delete('/wishlist/:slug', protect, removeFromWishlist);

export default router;
