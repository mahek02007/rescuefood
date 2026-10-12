import { Router } from 'express';
import {
  getDonations,
  getDonationById,
  createDonation,
  claimDonation,
  assignVolunteer,
  updateDeliveryStatus,
  cancelDonation,
} from '../controllers/donationController.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';

const router = Router();

// Public / open browsing
router.get('/', getDonations);
router.get('/:id', getDonationById);

// Protected actions
router.post('/', authenticateToken as any, requireRoles(['donor', 'admin']) as any, createDonation as any);
router.put('/:id/claim', authenticateToken as any, requireRoles(['ngo', 'admin']) as any, claimDonation as any);
router.put('/:id/volunteer', authenticateToken as any, requireRoles(['volunteer', 'admin']) as any, assignVolunteer as any);
router.put('/:id/delivery-status', authenticateToken as any, updateDeliveryStatus as any);
router.put('/:id/cancel', authenticateToken as any, cancelDonation as any);

export default router;
