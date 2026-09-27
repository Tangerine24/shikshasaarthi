import { Router } from 'express';
import { JagoController } from './jago.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { jagoLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/chat', jagoLimiter, JagoController.chat);
router.get('/conversations', JagoController.listConversations);
router.get('/conversations/:id', JagoController.getConversation);

export default router;
