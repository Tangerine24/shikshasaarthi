import { Request, Response } from 'express';
import { AdminService } from './admin.service';

export const AdminController = {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getPendingProviders(req: Request, res: Response) {
    try {
      const providers = await AdminService.getPendingProviders();
      res.json({ success: true, data: providers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async approveProvider(req: Request, res: Response) {
    try {
      const actorId = (req as any).user.id;
      const { id } = req.params;
      const provider = await AdminService.verifyProvider(id, 'VERIFIED', actorId);
      res.json({ success: true, data: provider });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async rejectProvider(req: Request, res: Response) {
    try {
      const actorId = (req as any).user.id;
      const { id } = req.params;
      const provider = await AdminService.verifyProvider(id, 'REJECTED', actorId);
      res.json({ success: true, data: provider });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getAuditLog(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const pageSize = parseInt(req.query.pageSize as string || '20', 10);
      const data = await AdminService.getAuditLogs(page, pageSize);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getReachAnalytics(req: Request, res: Response) {
    try {
      const data = await AdminService.getReachAnalytics();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getPaymentMetrics(req: Request, res: Response) {
    try {
      const data = await AdminService.getPaymentMetrics();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

