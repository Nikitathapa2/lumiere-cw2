import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  listSessions,
  revokeSession,
  revokeAllSessions,
  stepUp,
} from '../controllers/sessionController.js';

const router = Router();

router.use(protect);

router.get('/', listSessions);
router.post('/step-up', stepUp);
router.delete('/', revokeAllSessions);
router.delete('/:id', revokeSession);

export default router;
