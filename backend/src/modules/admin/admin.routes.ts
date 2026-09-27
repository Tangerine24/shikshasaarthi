import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/providers/pending', AdminController.getPendingProviders);
router.post('/providers/:id/approve', AdminController.approveProvider);
router.post('/providers/:id/reject', AdminController.rejectProvider);
router.get('/audit-log', AdminController.getAuditLog);
router.get('/reach-analytics', AdminController.getReachAnalytics);
router.get('/payment-metrics', AdminController.getPaymentMetrics);

export default router;

