import { Router } from 'express';
import {
  getProducts,
  getNewArrivals,
  getProductBySlug,
} from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/:slug', getProductBySlug);

export default router;
