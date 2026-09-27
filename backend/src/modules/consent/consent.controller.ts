import { Request, Response } from 'express';
import { ConsentService } from './consent.service';

export const ConsentController = {
  async list(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await ConsentService.getConsents(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async grant(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { purpose, scope } = req.body;
      const result = await ConsentService.grantConsent(userId, purpose, scope);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async revoke(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const result = await ConsentService.revokeConsent(userId, id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
