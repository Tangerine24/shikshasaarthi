import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from './documents.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();
router.use(authMiddleware);

router.post('/', upload.single('file'), DocumentController.upload);
router.get('/', DocumentController.list);
router.delete('/:id', DocumentController.delete);
router.get('/readiness/:scholarshipId', DocumentController.getReadiness);
router.patch('/:id/verify', requireRole('PROVIDER', 'ADMIN'), DocumentController.verify);

export default router;
