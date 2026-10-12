import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken as any);
router.get('/', getUserNotifications as any);
router.patch('/:id/read', markNotificationRead as any);
router.patch('/read-all', markAllNotificationsRead as any);

export default router;
