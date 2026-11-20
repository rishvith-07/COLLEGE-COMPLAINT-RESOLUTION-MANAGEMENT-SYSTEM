import { Router } from 'express';
import {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Department list can be accessed by authenticated users (or students submitting complaints)
router.get('/', listDepartments);
router.get('/:id', getDepartmentById);

router.post('/', authenticateToken, requireRole(['ADMIN']), createDepartment);
router.put('/:id', authenticateToken, requireRole(['ADMIN', 'DEPARTMENT_HEAD']), updateDepartment);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteDepartment);

export default router;
