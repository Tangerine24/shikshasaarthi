import { Request, Response, NextFunction } from 'express';
import { ApplicationService } from './applications.service';
import { ApplicationStatus } from '../../types';

export const ApplicationController = {
  async createDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { scholarshipId } = req.body;
      const draft = await ApplicationService.createOrGetDraft(userId, scholarshipId);
      res.json({ success: true, data: draft });
    } catch (err) { next(err); }
  },

  async attachDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { documentId } = req.body;
      const attached = await ApplicationService.attachDocument(id, documentId, userId);
      res.json({ success: true, data: attached });
    } catch (err) { next(err); }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const app = await ApplicationService.submitApplication(id, userId);
      res.json({ success: true, data: app });
    } catch (err) { next(err); }
  },

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await ApplicationService.listStudentApplications(userId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async listProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const status = req.query.status as string;
      const data = await ApplicationService.listProviderApplications(userId, status);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const role = (req as any).user.role;
      const data = await ApplicationService.getApplication(req.params.id, userId, role);
      if (!data) {
        res.status(404).json({ success: false, error: 'Application not found' });
        return;
      }
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async transition(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { toStatus, note } = req.body;
      const updated = await ApplicationService.transitionStatus(id, toStatus as ApplicationStatus, userId, note);
      res.json({ success: true, data: updated });
    } catch (err) { next(err); }
  },
};
