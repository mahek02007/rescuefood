import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getAdminStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalDonations,
      activeDonations,
      completedDeliveries,
      donorsCount,
      ngosCount,
      volunteersCount,
      donationsAgg,
    ] = await Promise.all([
      prisma.donation.count(),
      prisma.donation.count({ where: { status: 'Available' } }),
      prisma.donation.count({ where: { status: 'Completed' } }),
      prisma.user.count({ where: { role: 'donor' } }),
      prisma.user.count({ where: { role: 'ngo' } }),
      prisma.user.count({ where: { role: 'volunteer' } }),
      prisma.donation.aggregate({
        _sum: {
          estimatedPeopleServed: true,
          quantityValue: true,
        },
      }),
    ]);

    const totalMealsRescued = donationsAgg._sum.estimatedPeopleServed || 0;
    // Environmental formula: 1 meal rescued ≈ 2.5 kg CO2 diverted and 180 liters water saved
    const co2DivertedKg = Math.round(totalMealsRescued * 2.5);
    const waterSavedLiters = Math.round(totalMealsRescued * 180);

    res.status(200).json({
      success: true,
      stats: {
        totalMealsRescued,
        activeDonors: donorsCount,
        partnerNgos: ngosCount,
        activeVolunteers: volunteersCount,
        totalDonations,
        activeDonations,
        successfulDeliveries: completedDeliveries,
        co2DivertedKg,
        waterSavedLiters,
      },
    });
  } catch (error: any) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching platform statistics.' });
  }
};

export const getAdminUsers = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        organization: true,
        address: true,
        city: true,
        area: true,
        pincode: true,
        avatar: true,
        isVerified: true,
        verificationStatus: true,
        joinedDate: true,
        createdAt: true,
        totalMealsRescued: true,
        totalDonations: true,
        totalDeliveries: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching users.' });
  }
};

export const getVerificationRequests = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const requests = await prisma.verificationRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            organization: true,
            city: true,
            avatar: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error: any) {
    console.error('Fetch verification requests error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching requests.' });
  }
};

export const reviewVerificationRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: 'Action must be "approve" or "reject".' });
      return;
    }

    const verification = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!verification) {
      res.status(404).json({ success: false, message: 'Verification request not found.' });
      return;
    }

    const newStatus = action === 'approve' ? 'verified' : 'rejected';

    const updated = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        notes: notes || `Request ${action}d by administrator.`,
      },
    });

    // Update the user's status
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        isVerified: action === 'approve',
        verificationStatus: newStatus,
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: verification.userId,
        title: action === 'approve' ? 'Organization Verified!' : 'Verification Update',
        message:
          action === 'approve'
            ? 'Congratulations! Your organization verification request has been approved.'
            : 'Your organization verification request was not approved. Please contact support.',
        type: 'verification',
      },
    });

    res.status(200).json({
      success: true,
      message: `Verification request ${action}d successfully.`,
      verification: updated,
    });
  } catch (error: any) {
    console.error('Review verification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error reviewing verification request.' });
  }
};
