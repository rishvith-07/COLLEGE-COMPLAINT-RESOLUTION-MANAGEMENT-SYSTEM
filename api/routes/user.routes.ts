import { Router } from 'express';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  getStaffMembers,
} from '../controllers/user.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Accessible by staff/admins for assignment selectors
router.get('/staff', getStaffMembers);

// User administration routes (restricted to Admin)
router.get('/', requireRole(['ADMIN']), listUsers);
router.post('/', requireRole(['ADMIN']), createUser);
router.get('/:id', requireRole(['ADMIN']), getUserById);
router.put('/:id', requireRole(['ADMIN']), updateUser);

export default router;
