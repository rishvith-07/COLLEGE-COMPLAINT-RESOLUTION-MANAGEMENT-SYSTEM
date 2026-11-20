import { Response } from 'express';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../types';

export const listComplaints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { status, priority, categoryId, departmentId, search, dateRange, startDate, endDate, staffAssignedOnly } = req.query;

    const filters: any = {
      status: status as string,
      priority: priority as string,
      categoryId: categoryId as string,
      departmentId: departmentId as string,
      search: search as string,
      dateRange: dateRange as string,
      startDate: startDate as string,
      endDate: endDate as string,
    };

    // Role-based data isolation
    if (user.role === 'STUDENT') {
      filters.studentId = user.id;
    } else if (user.role === 'STAFF' || user.role === 'FACULTY') {
      if (staffAssignedOnly === 'true') {
        filters.assignedToUserId = user.id;
      } else {
        // Staff can see complaints in their department or explicitly assigned to them
        filters.departmentId = user.departmentId || undefined;
      }
    } else if (user.role === 'DEPARTMENT_HEAD') {
      filters.departmentId = user.departmentId || undefined;
    }
    // ADMIN has full access without forced studentId/departmentId restrictions

    const complaints = await db.listComplaints(filters);

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve complaints.', error: err.message });
  }
};

export const getComplaintById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    // Role access authorization check
    if (user.role === 'STUDENT' && complaint.studentId !== user.id) {
      res.status(403).json({ success: false, message: 'Access denied. You can only view your own complaints.' });
      return;
    }

    if ((user.role === 'STAFF' || user.role === 'FACULTY' || user.role === 'DEPARTMENT_HEAD') && user.departmentId) {
      if (complaint.departmentId !== user.departmentId && complaint.assignedToUserId !== user.id) {
        res.status(403).json({ success: false, message: 'Access denied. Complaint belongs to another department.' });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve complaint details.', error: err.message });
  }
};

export const createComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { title, description, categoryId, departmentId, location, priority, incidentDate } = req.body;

    if (!title || !description || !categoryId || !departmentId) {
      res.status(400).json({
        success: false,
        message: 'Title, description, category, and department are required fields.',
      });
      return;
    }

    const year = new Date().getFullYear();
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const referenceNumber = `CMP-${year}-${randomDigits}`;

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      referenceNumber,
      studentId: user.id,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      departmentId,
      location: location ? location.trim() : null,
      priority: (priority as ComplaintPriority) || 'MEDIUM',
      incidentDate: incidentDate || new Date().toISOString().split('T')[0],
      status: 'SUBMITTED',
      assignedToUserId: null,
      expectedResolutionDate: null,
      resolvedAt: null,
      closedAt: null,
      isReopened: false,
      reopenCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createComplaint(newComplaint);

    // Audit log
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: user.id,
      action: 'CREATE_COMPLAINT',
      targetEntity: 'COMPLAINT',
      targetId: saved.id,
      details: { referenceNumber: saved.referenceNumber, title: saved.title },
      ipAddress: req.ip,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: saved,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit complaint.', error: err.message });
  }
};

export const updateStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required.' });
      return;
    }

    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const previousStatus = complaint.status;
    const updated = await db.updateComplaint(complaint.id, {
      status: status as ComplaintStatus,
    });

    // Record history
    await db.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: 'STATUS_CHANGE',
      previousStatus,
      newStatus: status as ComplaintStatus,
      performedByUserId: user.id,
      notes: notes || `Status updated to ${status} by ${user.fullName} (${user.role}).`,
      createdAt: new Date().toISOString(),
    });

    // Notify student
    await db.createNotification({
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      title: `Complaint Status: ${status}`,
      message: `Your complaint ${complaint.referenceNumber} status changed from ${previousStatus} to ${status}.`,
      type: 'STATUS_UPDATE',
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Audit log
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: user.id,
      action: 'UPDATE_COMPLAINT_STATUS',
      targetEntity: 'COMPLAINT',
      targetId: complaint.id,
      details: { previousStatus, newStatus: status, notes },
      ipAddress: req.ip,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update status.', error: err.message });
  }
};

export const assignComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { assignedToUserId, departmentId, expectedResolutionDate, notes } = req.body;

    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const previousStatus = complaint.status;
    const newStatus: ComplaintStatus = 'ASSIGNED';

    const updated = await db.updateComplaint(complaint.id, {
      assignedToUserId: assignedToUserId || complaint.assignedToUserId,
      departmentId: departmentId || complaint.departmentId,
      expectedResolutionDate: expectedResolutionDate || complaint.expectedResolutionDate,
      status: complaint.status === 'SUBMITTED' || complaint.status === 'UNDER_REVIEW' ? newStatus : complaint.status,
    });

    let assignedStaffName = 'staff member';
    if (assignedToUserId) {
      const staffUser = await db.findUserById(assignedToUserId);
      if (staffUser) {
        assignedStaffName = staffUser.fullName;
        // Notify assigned staff
        await db.createNotification({
          id: `notif-${Date.now()}`,
          userId: assignedToUserId,
          title: 'Complaint Assigned',
          message: `You were assigned complaint ${complaint.referenceNumber}: ${complaint.title}`,
          type: 'ASSIGNMENT',
          relatedComplaintId: complaint.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Add history
    await db.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: 'ASSIGNED',
      previousStatus,
      newStatus: updated?.status,
      performedByUserId: user.id,
      notes: notes || `Assigned to ${assignedStaffName} by ${user.fullName}. Expected by ${expectedResolutionDate || 'TBD'}.`,
      createdAt: new Date().toISOString(),
    });

    // Notify student
    await db.createNotification({
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      title: 'Complaint Assigned',
      message: `Your complaint ${complaint.referenceNumber} has been assigned for investigation.`,
      type: 'ASSIGNMENT',
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to assign complaint.', error: err.message });
  }
};

export const requestInformation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Clarification inquiry message is required.' });
      return;
    }

    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    // Transition status to WAITING_FOR_STUDENT
    const updated = await db.updateComplaint(complaint.id, {
      status: 'WAITING_FOR_STUDENT',
    });

    // Post to comment thread
    await db.createComplaintComment({
      id: `comm-${Date.now()}`,
      complaintId: complaint.id,
      authorId: user.id,
      message,
      isInternal: false,
      createdAt: new Date().toISOString(),
    });

    // Record history
    await db.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: 'INFO_REQUESTED',
      previousStatus: complaint.status,
      newStatus: 'WAITING_FOR_STUDENT',
      performedByUserId: user.id,
      notes: `Requested additional information from student: ${message}`,
      createdAt: new Date().toISOString(),
    });

    // Notify student
    await db.createNotification({
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      title: 'Additional Information Requested',
      message: `${user.fullName} requested clarification regarding ${complaint.referenceNumber}.`,
      type: 'INFO_REQUEST',
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Information request sent to student.',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to request information.', error: err.message });
  }
};

export const escalateComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { reason } = req.body;

    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const updated = await db.updateComplaint(complaint.id, {
      status: 'ESCALATED',
      priority: 'URGENT',
    });

    await db.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: 'ESCALATED',
      previousStatus: complaint.status,
      newStatus: 'ESCALATED',
      performedByUserId: user.id,
      notes: `Escalated by ${user.fullName}: ${reason || 'Urgent resolution required.'}`,
      createdAt: new Date().toISOString(),
    });

    // Notify administrators
    await db.createNotification({
      id: `notif-${Date.now()}`,
      userId: 'usr-admin',
      title: 'Urgent Complaint Escalation',
      message: `${complaint.referenceNumber} has been escalated: ${reason || 'High priority action needed.'}`,
      type: 'ESCALATION',
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Complaint escalated successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to escalate complaint.', error: err.message });
  }
};

export const resolveComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { resolutionDescription, investigationSummary, supportingDocumentUrl, supportingDocumentName } = req.body;

    if (!resolutionDescription) {
      res.status(400).json({ success: false, message: 'Resolution description is required.' });
      return;
    }

    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const resolution = await db.upsertResolution({
      id: `res-${Date.now()}`,
      complaintId: complaint.id,
      resolvedByUserId: user.id,
      resolutionDescription,
      investigationSummary: investigationSummary || null,
      supportingDocumentUrl: supportingDocumentUrl || null,
      supportingDocumentName: supportingDocumentName || null,
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const refreshed = await db.findComplaintById(complaint.id);

    res.status(200).json({
      success: true,
      message: 'Complaint resolved successfully.',
      data: refreshed,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to resolve complaint.', error: err.message });
  }
};

export const reopenComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ success: false, message: 'Reopening reason is required.' });
      return;
    }

    const updated = await db.reopenComplaint(id, user.id, reason);

    res.status(200).json({
      success: true,
      message: 'Complaint reopened successfully.',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const submitFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { rating, comments, isSatisfied } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Rating between 1 and 5 is required.' });
      return;
    }

    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    if (complaint.studentId !== user.id) {
      res.status(403).json({ success: false, message: 'Only the lodging student can provide resolution feedback.' });
      return;
    }

    const feedback = await db.createFeedback({
      id: `fb-${Date.now()}`,
      complaintId: complaint.id,
      studentId: user.id,
      rating: Number(rating),
      comments: comments || null,
      isSatisfied: isSatisfied !== undefined ? Boolean(isSatisfied) : true,
      createdAt: new Date().toISOString(),
    });

    const refreshed = await db.findComplaintById(complaint.id);

    res.status(200).json({
      success: true,
      message: 'Feedback submitted and complaint closed.',
      data: refreshed,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit feedback.', error: err.message });
  }
};

export const getComplaintHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const history = await db.listComplaintHistory(id);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve complaint history.', error: err.message });
  }
};

export const getComplaintComments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    // Students cannot view internal staff notes
    const includeInternal = user.role !== 'STUDENT';
    const comments = await db.listComplaintComments(id, includeInternal);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve comments.', error: err.message });
  }
};

export const addComplaintComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { message, isInternal, attachmentUrl, attachmentName } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Comment message is required.' });
      return;
    }

    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    // Only staff/admin can mark comment internal
    const markInternal = user.role !== 'STUDENT' ? Boolean(isInternal) : false;

    const comment = await db.createComplaintComment({
      id: `comm-${Date.now()}`,
      complaintId: complaint.id,
      authorId: user.id,
      message: message.trim(),
      isInternal: markInternal,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      data: comment,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to post comment.', error: err.message });
  }
};
