import { Router } from 'express';
import {
  getPublicStats,
  getStudentDashboard,
  getStaffDashboard,
  getAdminDashboard,
} from '../controllers/dashboard.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public statistics for landing page
router.get('/public', getPublicStats);

// Role-tailored dashboards
router.get('/student', authenticateToken, getStudentDashboard);
router.get(
  '/staff',
  authenticateToken,
  requireRole(['STAFF', 'FACULTY', 'DEPARTMENT_HEAD', 'ADMIN']),
  getStaffDashboard
);
router.get('/admin', authenticateToken, requireRole(['ADMIN']), getAdminDashboard);

export default router;
