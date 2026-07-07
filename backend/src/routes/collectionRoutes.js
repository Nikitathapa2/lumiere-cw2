import { Router } from 'express';
import { getCollections, getCollectionBySlug } from '../controllers/collectionController.js';

const router = Router();

router.get('/', getCollections);
router.get('/:slug', getCollectionBySlug);

export default router;
