import { Router } from 'express';
import {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategoryById);

router.post('/', authenticateToken, requireRole(['ADMIN']), createCategory);
router.put('/:id', authenticateToken, requireRole(['ADMIN']), updateCategory);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteCategory);

export default router;
