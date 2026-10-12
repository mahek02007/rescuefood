import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getUserNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { role: req.user.role },
          { role: 'all' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.status(200).json({
      success: true,
      notifications: notifications.map((n: any) => ({
        ...n,
        timestamp: n.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching notifications.' });
  }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (error: any) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating notification.' });
  }
};

export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: req.user.id },
          { role: req.user.role },
          { role: 'all' },
        ],
      },
      data: { read: true },
    });

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating notifications.' });
  }
};
