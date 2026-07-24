import { Router } from 'express';
import { listAuditLog, verifyChain } from '../controllers/auditController.js';

const router = Router();

router.get('/', listAuditLog);
router.get('/verify', verifyChain);

export default router;
