import { Request, Response, NextFunction } from 'express';
import { StudentService } from './students.service';

export const StudentController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await StudentService.getProfile(req.user!.id, req.user!.id);
      res.json({ success: true, data: profile });
    } catch (err) { next(err); }
  },
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await StudentService.updateProfile(req.user!.id, req.body);
      res.json({ success: true, data: profile });
    } catch (err) { next(err); }
  }
};
