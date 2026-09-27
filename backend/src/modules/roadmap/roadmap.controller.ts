import { Request, Response } from 'express';
import { RoadmapService } from './roadmap.service';

export const RoadmapController = {
  async getStudentRoadmap(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = await RoadmapService.getStudentRoadmap(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getScholarshipRoadmap(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { scholarshipId } = req.params;
      const data = await RoadmapService.getScholarshipDetailRoadmap(userId, scholarshipId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
