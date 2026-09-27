import { Request, Response } from 'express';
import { NotificationService } from './notifications.service';

export const NotificationController = {
  async list(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = await NotificationService.listUserNotifications(userId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async markRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      await NotificationService.markAsRead(id, userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async markAllRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      await NotificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
