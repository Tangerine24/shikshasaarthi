import { Router } from 'express';
import { ConsentController } from './consent.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/', ConsentController.list);
router.post('/', ConsentController.grant);
router.post('/:id/revoke', ConsentController.revoke);

export default router;
