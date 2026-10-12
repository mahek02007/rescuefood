import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  getVerificationRequests,
  reviewVerificationRequest,
} from '../controllers/adminController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

// Allow admin only
router.use(authenticateToken as any, requireRoles(['admin']) as any);

router.get('/stats', getAdminStats as any);
router.get('/users', getAdminUsers as any);
router.get('/verifications', getVerificationRequests as any);
router.patch('/verifications/:id', reviewVerificationRequest as any);

export default router;
