import { Router } from 'express';
import { EligibilityController } from './eligibility.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);
router.post('/check', EligibilityController.check);

export default router;
