import { Response } from 'express';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getReportsOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { dateRange, departmentId, categoryId } = req.query;

    const stats = await db.getDashboardStatistics(user, dateRange as string);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate report overview.', error: err.message });
  }
};

export const exportComplaintsCsv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { status, priority, departmentId, categoryId, dateRange } = req.query;

    const filters: any = {
      status: status as string,
      priority: priority as string,
      departmentId: departmentId as string,
      categoryId: categoryId as string,
      dateRange: dateRange as string,
    };

    if (user.role === 'STUDENT') {
      filters.studentId = user.id;
    } else if ((user.role === 'STAFF' || user.role === 'FACULTY' || user.role === 'DEPARTMENT_HEAD') && user.departmentId) {
      filters.departmentId = user.departmentId;
    }

    const complaints = await db.listComplaints(filters);

    // CSV Headers
    const headers = [
      'Reference Number',
      'Title',
      'Category',
      'Department',
      'Priority',
      'Status',
      'Student Name',
      'Student Email',
      'Assigned Staff',
      'Submitted Date',
      'Resolved Date',
      'Rating',
      'Resolution Notes',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = complaints.map((c) => [
      escapeCsv(c.referenceNumber),
      escapeCsv(c.title),
      escapeCsv(c.category?.name || 'General'),
      escapeCsv(c.department?.name || 'General'),
      escapeCsv(c.priority),
      escapeCsv(c.status),
      escapeCsv(c.student?.fullName || 'N/A'),
      escapeCsv(c.student?.email || 'N/A'),
      escapeCsv(c.assignedTo?.fullName || 'Unassigned'),
      escapeCsv(c.createdAt),
      escapeCsv(c.resolvedAt || 'N/A'),
      escapeCsv(c.feedback?.rating ? `${c.feedback.rating}/5` : 'N/A'),
      escapeCsv(c.resolution?.resolutionDescription || 'N/A'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="complaints_report_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to export CSV report.', error: err.message });
  }
};
