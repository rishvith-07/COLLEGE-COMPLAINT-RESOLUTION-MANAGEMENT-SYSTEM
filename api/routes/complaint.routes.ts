import { Router } from 'express';
import {
  listComplaints,
  getComplaintById,
  createComplaint,
  updateStatus,
  assignComplaint,
  requestInformation,
  escalateComplaint,
  resolveComplaint,
  reopenComplaint,
  submitFeedback,
  getComplaintHistory,
  getComplaintComments,
  addComplaintComment,
} from '../controllers/complaint.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Complaints CRUD and filters
router.get('/', listComplaints);
router.post('/', createComplaint);
router.get('/:id', getComplaintById);

// Status, Assignment & Investigation
router.put('/:id/status', requireRole(['ADMIN', 'DEPARTMENT_HEAD', 'STAFF', 'FACULTY']), updateStatus);
router.post('/:id/assign', requireRole(['ADMIN', 'DEPARTMENT_HEAD']), assignComplaint);
router.post('/:id/request-information', requireRole(['ADMIN', 'DEPARTMENT_HEAD', 'STAFF', 'FACULTY']), requestInformation);
router.post('/:id/escalate', requireRole(['ADMIN', 'DEPARTMENT_HEAD', 'STAFF', 'FACULTY']), escalateComplaint);

// Resolution & Student Feedback & Reopening
router.post('/:id/resolve', requireRole(['ADMIN', 'DEPARTMENT_HEAD', 'STAFF', 'FACULTY']), resolveComplaint);
router.post('/:id/reopen', reopenComplaint);
router.post('/:id/feedback', submitFeedback);

// Lifecycle Tracking & Discussion Comments
router.get('/:id/history', getComplaintHistory);
router.get('/:id/comments', getComplaintComments);
router.post('/:id/comments', addComplaintComment);

export default router;
