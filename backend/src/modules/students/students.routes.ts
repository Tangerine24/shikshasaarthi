import { Router } from 'express';
import { StudentController } from './students.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/profile', requireRole('STUDENT'), StudentController.getProfile);
router.patch('/profile', requireRole('STUDENT'), StudentController.updateProfile);

export default router;
