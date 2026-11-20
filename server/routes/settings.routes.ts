import { Router } from 'express';
import { getAuditLogs, getSystemSettings, updateSystemSettings } from '../controllers/settings.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/audit-logs', requireRole(['ADMIN']), getAuditLogs);
router.get('/system', requireRole(['ADMIN']), getSystemSettings);
router.put('/system', requireRole(['ADMIN']), updateSystemSettings);

export default router;
