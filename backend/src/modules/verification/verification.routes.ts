import { Router, Request, Response, NextFunction } from 'express';
import { VerificationController } from './verification.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

const providerAdminCheck = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user?.role;
  if (role !== 'PROVIDER' && role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  next();
};

router.use(authMiddleware);
router.get('/exceptions', providerAdminCheck, VerificationController.listExceptions);
router.get('/exceptions/:id', VerificationController.getException);
router.post('/exceptions/:id/resolve', providerAdminCheck, VerificationController.resolveException);
router.get('/application/:applicationId', VerificationController.listForApplication);

export default router;
