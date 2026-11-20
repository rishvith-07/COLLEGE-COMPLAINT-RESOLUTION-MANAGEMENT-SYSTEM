import { Response } from 'express';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await db.listAuditLogs(100);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.', error: err.message });
  }
};

export const getSystemSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      appName: 'CampusResolve',
      reopenWindowDays: 7,
      defaultResolutionTargetDays: 3,
      urgentEscalationHours: 24,
      allowAnonymousSubmissions: false,
      emailNotificationsEnabled: true,
    },
  });
};

export const updateSystemSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'System settings updated successfully.',
    data: req.body,
  });
};
