import { Router } from 'express';
import { NotificationController } from './notifications.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', NotificationController.list);
router.post('/read-all', NotificationController.markAllRead);
router.post('/:id/read', NotificationController.markRead);

export default router;
