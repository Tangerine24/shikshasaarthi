import { Router } from 'express';
import { ApplicationController } from './applications.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/draft', ApplicationController.createDraft);
router.post('/:id/documents', ApplicationController.attachDocument);
router.post('/:id/submit', ApplicationController.submit);
router.get('/mine', ApplicationController.listMine);
router.get('/provider', ApplicationController.listProvider);
router.get('/:id', ApplicationController.getOne);
router.post('/:id/transition', ApplicationController.transition);

export default router;
