import { Response } from 'express';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getPublicStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const complaints = await db.listComplaints({});
    const departments = await db.listDepartments();

    const totalSubmitted = complaints.length;
    const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const activeDepartments = departments.filter((d) => d.status === 'ACTIVE').length;

    // Average resolution time in hours/days
    const resolvedList = complaints.filter((c) => c.resolvedAt);
    let avgResolutionDays = 2.4;
    if (resolvedList.length > 0) {
      const totalDays = resolvedList.reduce((acc, c) => {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.resolvedAt!).getTime();
        return acc + Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
      }, 0);
      avgResolutionDays = Number((totalDays / resolvedList.length).toFixed(1));
    }

    res.status(200).json({
      success: true,
      data: {
        totalComplaints: totalSubmitted,
        resolvedComplaints: resolvedCount,
        resolutionRate: totalSubmitted > 0 ? Math.round((resolvedCount / totalSubmitted) * 100) : 0,
        averageResolutionDays: avgResolutionDays,
        activeDepartments,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve stats.', error: err.message });
  }
};

export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { dateRange } = req.query;

    const stats = await db.getDashboardStatistics(user, dateRange as string);
    const complaints = await db.listComplaints({ studentId: user.id, dateRange: dateRange as string });

    const recentComplaints = complaints.slice(0, 5);
    const awaitingStudent = complaints.filter((c) => c.status === 'WAITING_FOR_STUDENT');
    const recentlyResolved = complaints.filter((c) => c.status === 'RESOLVED').slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentComplaints,
        awaitingStudent,
        recentlyResolved,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load student dashboard.', error: err.message });
  }
};

export const getStaffDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { dateRange } = req.query;

    const stats = await db.getDashboardStatistics(user, dateRange as string);

    // Assigned specifically to staff
    const assignedComplaints = await db.listComplaints({
      assignedToUserId: user.id,
      dateRange: dateRange as string,
    });

    // Entire department complaints
    const departmentComplaints = await db.listComplaints({
      departmentId: user.departmentId || undefined,
      dateRange: dateRange as string,
    });

    const urgentComplaints = (user.role === 'DEPARTMENT_HEAD' ? departmentComplaints : assignedComplaints).filter(
      (c) => c.priority === 'URGENT' && c.status !== 'RESOLVED' && c.status !== 'CLOSED'
    );

    const now = Date.now();
    const overdueComplaints = (user.role === 'DEPARTMENT_HEAD' ? departmentComplaints : assignedComplaints).filter(
      (c) =>
        c.expectedResolutionDate &&
        new Date(c.expectedResolutionDate).getTime() < now &&
        c.status !== 'RESOLVED' &&
        c.status !== 'CLOSED'
    );

    res.status(200).json({
      success: true,
      data: {
        stats,
        assignedComplaints: assignedComplaints.slice(0, 8),
        departmentComplaints: departmentComplaints.slice(0, 8),
        urgentComplaints,
        overdueComplaints,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load staff dashboard.', error: err.message });
  }
};

export const getAdminDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { dateRange } = req.query;

    const stats = await db.getDashboardStatistics(user, dateRange as string);
    const recentComplaints = (await db.listComplaints({ dateRange: dateRange as string })).slice(0, 8);
    const auditLogs = await db.listAuditLogs(6);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentComplaints,
        recentAuditLogs: auditLogs,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load admin dashboard.', error: err.message });
  }
};
