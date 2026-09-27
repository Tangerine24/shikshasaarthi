import { Router } from 'express';
import { ProviderController } from './providers.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/dashboard', requireRole('PROVIDER'), ProviderController.dashboard);

export default router;
