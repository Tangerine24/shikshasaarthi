import { Request, Response } from 'express';
import { PassportService } from './passport.service';

export const PassportController = {
  async getPassport(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await PassportService.getPassport(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
