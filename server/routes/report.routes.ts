import { Router } from 'express';
import { getReportsOverview, exportComplaintsCsv } from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/overview', getReportsOverview);
router.get('/export/csv', exportComplaintsCsv);

export default router;
