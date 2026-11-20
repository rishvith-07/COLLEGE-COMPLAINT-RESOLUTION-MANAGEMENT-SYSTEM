import { Response } from 'express';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const listNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const notifications = await db.listNotifications(user.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.', error: err.message });
  }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    await db.markNotificationRead(id, user.id);
    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to mark notification read.', error: err.message });
  }
};

export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const count = await db.markAllNotificationsRead(user.id);
    res.status(200).json({ success: true, message: `${count} notifications marked as read.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to mark all read.', error: err.message });
  }
};
