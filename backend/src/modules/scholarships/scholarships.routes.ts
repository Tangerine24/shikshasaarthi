import { Router } from 'express';
import { ScholarshipController } from './scholarships.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/', ScholarshipController.list);
router.get('/provider', authMiddleware, requireRole('PROVIDER'), ScholarshipController.listProviderScholarships);
router.get('/:id', ScholarshipController.getOne);
router.post('/', authMiddleware, requireRole('PROVIDER'), ScholarshipController.create);
router.patch('/:id', authMiddleware, requireRole('PROVIDER'), ScholarshipController.update);

export default router;
