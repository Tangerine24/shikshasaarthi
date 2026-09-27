import { Router } from 'express';
import { RoadmapController } from './roadmap.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', RoadmapController.getStudentRoadmap);
router.get('/:scholarshipId', RoadmapController.getScholarshipRoadmap);

export default router;
