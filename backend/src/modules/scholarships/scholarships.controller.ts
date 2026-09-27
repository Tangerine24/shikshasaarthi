import { Request, Response, NextFunction } from 'express';
import { ScholarshipService } from './scholarships.service';

export const ScholarshipController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, state, education, sort } = req.query as Record<string, string>;
      const data = await ScholarshipService.listPublished({ search, state, education, sort });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ScholarshipService.getOne(req.params.id);
      if (!data) {
        res.status(404).json({ success: false, error: 'Scholarship not found' });
        return;
      }
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async listProviderScholarships(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await ScholarshipService.listByProvider(userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await ScholarshipService.create(userId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await ScholarshipService.update(req.params.id, userId, req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
