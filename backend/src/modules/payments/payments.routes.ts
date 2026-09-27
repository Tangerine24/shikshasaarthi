import { Router } from 'express';
import { PaymentController } from './payments.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);
router.get('/application/:applicationId', PaymentController.getTimeline);
router.get('/summary', PaymentController.getSummary);

export default router;
