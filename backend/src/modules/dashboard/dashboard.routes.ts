import { Router } from 'express';
import { getDashboardMetricsHandler } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Dashboard requires authentication
router.use(authenticate);

router.get('/', getDashboardMetricsHandler);

export default router;
