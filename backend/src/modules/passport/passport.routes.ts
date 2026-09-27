import { Router } from 'express';
import { PassportController } from './passport.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/', requireRole('STUDENT'), PassportController.getPassport);

export default router;
