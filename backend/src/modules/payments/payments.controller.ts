import { Request, Response } from 'express';
import { PaymentService } from './payments.service';

export const PaymentController = {
  async getTimeline(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const result = await PaymentService.getPaymentTimeline(applicationId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getSummary(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await PaymentService.getPaymentSummary(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
