import { Request, Response, NextFunction } from 'express';
import { ProviderService } from './providers.service';

export const ProviderController = {
  async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProviderService.getDashboard(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
};
